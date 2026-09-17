import { SYNERGIES, interventionOf } from "./catalog";
import { pipeFeedsWell } from "./diagnose";
import { dist, clamp } from "./format";
import type {
  ActiveSynergy,
  Derived,
  InactivePlacement,
  InterventionType,
  Placement,
  PovertyDriver,
  Requirement,
  SimResult,
  Systems,
  Village,
  World,
} from "./types";
import { EMPTY_SYSTEMS, QUIET_WORLD } from "./village";

function addSystems(target: Systems, partial: Partial<Systems>) {
  for (const [key, value] of Object.entries(partial) as [keyof Systems, number | undefined][]) {
    if (!value) continue;
    target[key] += value;
  }
}

function matchesReq(
  origin: Placement,
  req: Requirement,
  functional: Set<string>,
  placements: Placement[],
) {
  return placements.some((candidate) => {
    if (candidate.type !== req.type) return false;
    if (!functional.has(candidate.id)) return false;
    if (req.maxDist != null && dist(origin, candidate) > req.maxDist) {
      return false;
    }
    return true;
  });
}

function missingFor(
  placement: Placement,
  functional: Set<string>,
  placements: Placement[],
) {
  const def = interventionOf(placement.type);
  const missing: string[] = [];

  for (const req of def.requires) {
    if (!matchesReq(placement, req, functional, placements)) {
      const other = interventionOf(req.type);
      missing.push(
        req.maxDist != null
          ? `${other.shortName} nearby`
          : other.shortName,
      );
    }
  }

  if (def.requiresAny && def.requiresAny.length > 0) {
    const ok = def.requiresAny.some((req) =>
      matchesReq(placement, req, functional, placements),
    );
    if (!ok) {
      missing.push(
        def.requiresAny.map((req) => interventionOf(req.type).shortName).join(" or "),
      );
    }
  }

  return missing;
}

function resolveFunctional(placements: Placement[]) {
  const functional = new Set<string>();
  const inactive = new Map<string, string[]>();

  for (let pass = 0; pass < placements.length + 2; pass++) {
    let changed = false;
    for (const placement of placements) {
      if (functional.has(placement.id)) continue;
      const missing = missingFor(placement, functional, placements);
      if (missing.length === 0) {
        functional.add(placement.id);
        inactive.delete(placement.id);
        changed = true;
      } else {
        inactive.set(placement.id, missing);
      }
    }
    if (!changed) break;
  }

  const inactiveList: InactivePlacement[] = [...inactive.entries()].map(
    ([id, missing]) => {
      const placement = placements.find((item) => item.id === id)!;
      return { id, type: placement.type, missing };
    },
  );

  return { functional, inactive: inactiveList };
}

function resolveSynergies(
  placements: Placement[],
  functional: Set<string>,
) {
  const live = placements.filter((item) => functional.has(item.id));
  const used = new Set<string>();
  const active: ActiveSynergy[] = [];
  const bonus: Systems = { ...EMPTY_SYSTEMS };

  for (const synergy of SYNERGIES) {
    for (const left of live) {
      if (left.type !== synergy.a.type) continue;
      const right = live.find((candidate) => {
        if (candidate.id === left.id) return false;
        if (candidate.type !== synergy.b.type) return false;
        const pairKey = [left.id, candidate.id].sort().join(":");
        if (used.has(`${synergy.id}:${pairKey}`)) return false;
        const reach = synergy.b.maxDist ?? synergy.a.maxDist;
        const linked =
          (left.type === "well" &&
            candidate.type === "pipeline" &&
            pipeFeedsWell(left, candidate)) ||
          (left.type === "pipeline" &&
            candidate.type === "well" &&
            pipeFeedsWell(candidate, left));
        if (reach != null && dist(left, candidate) > reach && !linked) {
          return false;
        }
        return true;
      });
      if (!right) continue;
      const pairKey = [left.id, right.id].sort().join(":");
      used.add(`${synergy.id}:${pairKey}`);
      addSystems(bonus, synergy.effects);
      if (!active.some((item) => item.id === synergy.id)) {
        active.push({
          id: synergy.id,
          label: synergy.label,
          why: synergy.why,
        });
      }
    }
  }

  return { active, bonus };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function derive(
  village: Village,
  systems: Systems,
  placements: Placement[],
  functional: Set<string>,
  world: World,
): { derived: Derived; drivers: PovertyDriver[] } {
  const flags = world.flags;
  const live = (type: Placement["type"]) =>
    placements.some((item) => item.type === type && functional.has(item.id));

  const well = live("well");
  const pump = live("solar_pump");
  const tank = live("water_tank") || live("elevated_tank");
  const pipe = live("pipeline");
  const taps = live("house_taps");
  const still = live("solar_still") || live("clay_filter");
  const kiosk = live("main_water_line");
  const school = live("school");
  const market = live("market");
  const skills = live("skill_center");
  const clinic = live("clinic");
  const solar = live("solar_farm");

  let connectedShare = 0.12;
  if (well) connectedShare = 0.22;
  if (well && (tank || pump)) connectedShare = 0.38;
  if (pipe && tank) connectedShare = flags.pipelinePartial && !taps ? 0.6 : 0.72;
  if (taps) connectedShare = 0.86;
  if (kiosk && connectedShare < 0.45) connectedShare = 0.45;

  let waterHours = 3;
  if (well) waterHours = 2.4;
  if (well && (tank || pump)) waterHours = 1.5;
  if (pipe && tank) waterHours = 1.1;
  if (taps) waterHours = 0.5;
  if (kiosk) waterHours = Math.min(waterHours, 1.6);
  if (flags.drought) waterHours += tank ? 0.4 : 1.2;
  waterHours = Math.max(0.3, waterHours);

  let waterAccess = village.waterAccess;
  waterAccess += well ? 6 : 0;
  waterAccess += pump ? 8 : 0;
  waterAccess += tank ? 7 : 0;
  waterAccess += pipe ? 6 : 0;
  waterAccess += taps ? 10 : 0;
  waterAccess += still ? 4 : 0;
  waterAccess += kiosk ? 8 : 0;
  if (flags.drought) waterAccess -= tank ? 6 : 16;
  if (flags.pipelinePartial && pipe && !taps) {
    waterAccess = village.waterAccess + (waterAccess - village.waterAccess) * 0.6;
  }

  let electricityAccess = village.electricityAccess + systems.energy * 0.55 + systems.grid * 0.5;
  if (flags.solarBroken && solar) electricityAccess = village.electricityAccess + (electricityAccess - village.electricityAccess) * 0.35;

  const skilledShare = skills ? 42 : 8;
  let employmentRate = village.employmentRate;
  if (market && !skills) employmentRate += 3;
  if (market && skills) employmentRate += 16;
  if (skills && !market) employmentRate += 4;
  employmentRate += systems.processing * 0.1;
  employmentRate += systems.livestockSupport * 0.08;
  employmentRate += systems.digital * 0.12;
  employmentRate += systems.roads * 0.05;
  employmentRate += systems.finance * 0.06;
  if (flags.harvest) employmentRate -= market ? 8 : 4;

  const livestockHealth =
    village.livestockHealth +
    (100 - waterHours * 18) * 0.08 +
    systems.livestockSupport * 0.45 -
    (flags.drought ? 8 : 0);

  const agricultureProductivity =
    village.agricultureProductivity + (well && pump ? 12 : well ? 4 : 0) + systems.energy * 0.06 - (flags.drought ? 10 : 0);

  let averageIncome =
    village.averageIncome *
    (1 +
      ((employmentRate - village.employmentRate) / 100) * 0.85 +
      (3 - waterHours) * 0.03 +
      systems.markets * 0.002 +
      systems.processing * 0.0025 +
      systems.finance * 0.002);
  if (market && !skills) averageIncome *= 1.02;
  if (flags.harvest) averageIncome *= 0.96;

  const childLabor = clamp(
    27 -
      (employmentRate - village.employmentRate) * 0.4 -
      ((averageIncome - village.averageIncome) / village.averageIncome) * 14 -
      (3 - waterHours) * 3.5 +
      (flags.harvest ? 6 : 0),
    5,
    40,
  );

  const weeklySchoolAttendance = school
    ? clamp(38 + (27 - childLabor) * 1.15 + (waterHours < 1.2 ? 6 : 0) - (flags.harvest ? 10 : 0), 18, 92)
    : village.schoolAttendance;

  const schoolAttendance = school ? weeklySchoolAttendance : village.schoolAttendance;

  let healthAccess =
    village.healthAccess +
    (clinic ? (waterAccess > 48 ? 18 : 5) : 0) +
    (waterAccess - village.waterAccess) * 0.14 +
    systems.roads * 0.06 +
    (still ? 6 : 0);
  if (clinic && waterAccess < 45) {
    healthAccess = village.healthAccess + 5;
  }

  waterAccess = clamp(waterAccess);
  electricityAccess = clamp(electricityAccess);
  employmentRate = clamp(employmentRate);
  healthAccess = clamp(healthAccess);
  averageIncome = Math.max(8_000, Math.round(averageIncome));

  const incomeDelta = (averageIncome - village.averageIncome) / village.averageIncome;
  const drivers: PovertyDriver[] = [
    {
      key: "income",
      title: "Household income",
      detail: "Earnings from work, livestock, and better selling prices.",
      points: round1(-incomeDelta * 22),
    },
    {
      key: "employment",
      title: "Employment",
      detail: "Additional household earners reduce poverty directly.",
      points: round1(-(employmentRate - village.employmentRate) * 0.22),
    },
    {
      key: "water",
      title: "Water availability",
      detail: "Fewer water-related expenses and more time for productive work.",
      points: round1(-(waterAccess - village.waterAccess) * 0.12),
    },
    {
      key: "health",
      title: "Health access",
      detail: "Fewer lost workdays and lower catastrophic health costs.",
      points: round1(-(healthAccess - village.healthAccess) * 0.08),
    },
    {
      key: "education",
      title: "School attendance",
      detail: "Children in school shifts longer-run household prospects.",
      points: round1(-(schoolAttendance - village.schoolAttendance) * 0.06),
    },
    {
      key: "energy",
      title: "Electricity",
      detail: "Light and power stretch working hours and enable services.",
      points: round1(-(electricityAccess - village.electricityAccess) * 0.04),
    },
  ];

  if (flags.drought) {
    drivers.push({
      key: "shock-water",
      title: "Drought",
      detail: "A dry spell taxes households that still buy or haul water.",
      points: 2.4,
    });
  }
  if (flags.harvest) {
    drivers.push({
      key: "shock-harvest",
      title: "Harvest season",
      detail: "Workers and children leave the dhani for seasonal work.",
      points: 1.6,
    });
  }
  if (flags.solarBroken) {
    drivers.push({
      key: "shock-solar",
      title: "Solar failure",
      detail: "Generation sagged until someone paid for maintenance.",
      points: 1.8,
    });
  }

  const povertyRate = clamp(
    village.povertyRate + drivers.reduce((sum, driver) => sum + driver.points, 0),
    8,
    95,
  );

  const dimensions = {
    income: clamp((averageIncome / 50_000) * 100),
    water: waterAccess,
    education: schoolAttendance,
    health: healthAccess,
    employment: employmentRate,
    energy: electricityAccess,
  };

  const developmentIndex = clamp(
    dimensions.income * 0.35 +
      dimensions.water * 0.2 +
      dimensions.education * 0.15 +
      dimensions.health * 0.15 +
      dimensions.employment * 0.1 +
      dimensions.energy * 0.05,
  );

  const derived: Derived = {
    waterAccess,
    electricityAccess,
    employmentRate,
    schoolAttendance,
    healthAccess,
    averageIncome,
    livestockHealth: clamp(livestockHealth),
    agricultureProductivity: clamp(agricultureProductivity),
    povertyRate,
    jobs: Math.round(village.families * (employmentRate / 100)),
    developmentIndex,
    dimensions,
    childLabor,
    waterHours,
    connectedShare: connectedShare * 100,
    weeklySchoolAttendance,
    skilledShare,
  };

  return { derived, drivers: drivers.filter((driver) => Math.abs(driver.points) >= 0.15) };
}

export function spentBudget(placements: Placement[]) {
  return placements.reduce((sum, item) => sum + interventionOf(item.type).cost, 0);
}

export function canPlace(
  type: InterventionType,
  placements: Placement[],
  budget: number,
  extraSpend = 0,
): { ok: boolean; reason?: string } {
  const def = interventionOf(type);
  const spent = spentBudget(placements) + extraSpend;
  if (spent + def.cost > budget) {
    return { ok: false, reason: `Not enough budget for ${def.name} (${formatHint(def.cost)}).` };
  }
  if (def.unique && placements.some((item) => item.type === type)) {
    return { ok: false, reason: `${def.name} can only be built once in this dhani.` };
  }
  return { ok: true };
}

function formatHint(cost: number) {
  return `Rs ${Math.round(cost).toLocaleString("en-IN")}`;
}

export function simulate(
  village: Village,
  placements: Placement[],
  world: World | null = null,
): SimResult {
  const used = world ?? QUIET_WORLD;
  const { functional, inactive } = resolveFunctional(placements);
  const systems: Systems = { ...EMPTY_SYSTEMS };

  for (const placement of placements) {
    if (!functional.has(placement.id)) continue;
    addSystems(systems, interventionOf(placement.type).effects);
  }

  const { active, bonus } = resolveSynergies(placements, functional);
  addSystems(systems, bonus);

  const { derived, drivers } = derive(village, systems, placements, functional, used);
  const spent = spentBudget(placements) + used.extraSpend;

  return {
    systems,
    derived,
    functionalIds: [...functional],
    inactive,
    synergies: active,
    drivers,
    spent,
    budgetRemaining: village.budget - spent,
  };
}

export function placementsByType(placements: Placement[], type: InterventionType) {
  return placements.filter((item) => item.type === type);
}
