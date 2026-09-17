import { CLUSTERS } from "./mapLayout";
import type { Placement, SimResult, Village, WorldFlags } from "./types";

export const TOTAL_WEEKS = 12;
export const SOLAR_REPAIR_COST = 40_000;

export type PlayMode = "observe" | "build" | "investigate";

export type TopicId =
  | "water"
  | "employment"
  | "education"
  | "health"
  | "electricity"
  | "income"
  | "migration"
  | "infrastructure";

export type TalkLine = {
  text: string;
  prompt?: string;
};

export type Talk = {
  speaker: string;
  role: string;
  lines: TalkLine[];
};

export function sketchQuestion(talk: Talk, depth: number) {
  const line = talk.lines[Math.min(depth, talk.lines.length - 1)];
  return `${talk.speaker} said: “${line.text}” What is actually going on? Sketch it in your own words.`;
}

export type Topic = {
  id: TopicId;
  label: string;
  layers: string[];
};

export type VillageEvent = {
  id: string;
  title: string;
  body: string;
  patch: Partial<WorldFlags>;
  repair?: "solar";
};

export const TOPICS: Topic[] = [
  {
    id: "water",
    label: "Water",
    layers: [
      "Women and girls walk about 3 hours a day. The tanker stop is 4 km.",
      "A well here drinks brackish aquifer water — monsoon rain that seeped into rock. People still wait for tankers they trust.",
      "The plant trunk is industrial process water. It will never become household taps.",
    ],
  },
  {
    id: "employment",
    label: "Employment",
    layers: [
      "About 28 in 100 adults have paid work this week. The rest keep goats or wait.",
      "Goat sales are distress sales. There is no packed road to a paying bazaar.",
      "A market without skilled workers is empty tables. Training without a stall is a certificate in a drawer.",
    ],
  },
  {
    id: "education",
    label: "Education",
    layers: [
      "A classroom does not create attendance. This week, many children never sat down.",
      "27% of children are working: water pots, goats, or wages in town.",
      "Attendance moves when a household can eat without a child's labour.",
    ],
  },
  {
    id: "health",
    label: "Health",
    layers: [
      "The nearest reliable midwife is a long sand drive.",
      "Diarrhoea follows brackish wells and uncovered tanker drums.",
      "A clinic without water is a locked room with a painted red cross.",
    ],
  },
  {
    id: "electricity",
    label: "Electricity",
    layers: [
      "18% of homes have a light after dark. Study and pumping stop at dusk.",
      "Pumps, clinic fridges, and night study need power that lasts.",
      "Solar without maintenance money dies in the first dust storm.",
    ],
  },
  {
    id: "income",
    label: "Income",
    layers: [
      "Typical household: about Rs 18,000 a month, mostly livestock.",
      "Hours spent on water are hours not spent on paid work.",
      "Income barely moves if the only 'job' is an empty stall.",
    ],
  },
  {
    id: "migration",
    label: "Migration",
    layers: [
      "Young men leave for mill work after harvest. The dhani thins out.",
      "Families stay if water and a wage exist here. Otherwise the school empties twice.",
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    layers: [
      "One goat track to town. No packed road. No household taps.",
      "A pipe to a tank still leaves courtyards unconnected — often 40% without a standpipe.",
      "Roads move patients, milk, teachers. They are not decoration.",
    ],
  },
];

function live(type: Placement["type"], placements: Placement[], result: SimResult) {
  return placements.filter((item) => item.type === type && result.functionalIds.includes(item.id));
}

function hasLive(type: Placement["type"], placements: Placement[], result: SimResult) {
  return live(type, placements, result).length > 0;
}

export function topicOf(id: TopicId) {
  return TOPICS.find((item) => item.id === id)!;
}

export function talkFor(
  landmark: string,
  placements: Placement[],
  result: SimResult,
): Talk {
  const { derived } = result;
  const school = hasLive("school", placements, result);
  const market = hasLive("market", placements, result);
  const skills = hasLive("skill_center", placements, result);
  const well = hasLive("well", placements, result);
  const tank =
    hasLive("water_tank", placements, result) || hasLive("elevated_tank", placements, result);
  const pipe = hasLive("pipeline", placements, result);
  const taps = hasLive("house_taps", placements, result);

  if (landmark === "west" || landmark === "south" || landmark === "north") {
    const house =
      landmark === "west" ? "Amna" : landmark === "south" ? "Hakeem" : "Fatima";
    const compound =
      landmark === "west" ? "west compound" : landmark === "south" ? "south dhani" : "north compound";
    const hours = derived.waterHours.toFixed(1);
    return {
      speaker: house,
      role: `${compound} · 100 families in this dhani`,
      lines: [
        {
          text: well
            ? `There is a well now. We still spend ${hours} hours on water. The hole is not the same as drinking.`
            : `We spend ${hours} hours every day collecting water. Pots, the walk, the wait.`,
          prompt: "Why?",
        },
        {
          text: well
            ? "The well drinks brackish groundwater. Children still go with cans because it is not trusted, and it is not at the door."
            : "The nearest tanker stop is 4 km. The plant pipe is not for us. It never was.",
          prompt: "Why not just a well?",
        },
        {
          text:
            pipe && tank && taps
              ? "The courtyard tap helps the compounds that got one. The rest still walk. A well alone was never the chain."
              : "A well without storage and treatment is a rope and a salty bucket. We still wait for a tanker we trust.",
        },
      ],
    };
  }

  if (landmark === "bazaar") {
    return {
      speaker: "Karim",
      role: "Shopkeeper on the goat track",
      lines: [
        {
          text: market
            ? skills
              ? "I have a stall on a packed track, and two people who can keep books. That is a shop."
              : "The market is open. I do not have workers who can run a stall. Shade is not a business."
            : "I have tea and shade. Traders do not come down a goat path with a pickup.",
          prompt: "Why?",
        },
        {
          text: market && !skills
            ? "Young people left after harvest, or they never learned to keep a stall. A market without skills is empty tables."
            : "Milk and goats sell cheap at the gate. Town prices live at the end of a packed road.",
          prompt: "And jobs?",
        },
        {
          text: "A stall is not employment. Employment is someone who can work, something to sell, and a way to reach a buyer.",
        },
      ],
    };
  }

  if (landmark === "trunk" || landmark === "valve" || landmark === "plant") {
    return {
      speaker: "Rashid",
      role: "Plant watchman",
      lines: [
        {
          text: "This water belongs to the scheme. It is process water. It is not for your chaunras.",
          prompt: "Why not tap the trunk?",
        },
        {
          text: "Thar homes do not have tap water. Village wells drink monsoon seepage in the rock. This pipe does not fill them.",
          prompt: "Then where does drinking water come from?",
        },
        {
          text: "From the aquifer, if you lift it, store it, and if it is salty, treat it. Not from us.",
        },
      ],
    };
  }

  if (landmark.startsWith("school") || landmark === "education") {
    return {
      speaker: "Ms. Bhatti",
      role: school ? "Teacher, new classroom" : "Teacher, under the khejri",
      lines: [
        {
          text: school
            ? `I opened the doors. ${Math.round(derived.weeklySchoolAttendance)}% of children attended this week.`
            : "There is no classroom here. Some children walk toward town. Many do not.",
          prompt: "Why so few?",
        },
        {
          text: `${Math.round(derived.childLabor)}% of children are working to support their families — water, goats, or wages.`,
          prompt: "Is the school the problem?",
        },
        {
          text: "The school was never the root. If the household needs a child's labour, the bench stays empty.",
        },
      ],
    };
  }

  if (landmark.startsWith("well")) {
    return {
      speaker: "You",
      role: "Inspecting the well",
      lines: [
        {
          text: "The well drinks the aquifer. The water tastes of salt. A rope. A bucket. A queue.",
          prompt: "Is this drinking water?",
        },
        {
          text: tank
            ? "Storage exists, but without treatment or a courtyard tap, people still haul."
            : "Without a pump, a tank, or a still, this is not a water system. It is a hole.",
        },
      ],
    };
  }

  if (landmark.startsWith("market")) {
    return talkFor("bazaar", placements, result);
  }

  if (landmark.startsWith("clinic")) {
    return {
      speaker: "Dr. Sameer",
      role: "Clinic",
      lines: [
        {
          text:
            derived.waterAccess < 50
              ? "I can sit here. I cannot wash. Without water this is a locked room."
              : "Water is here. Referrals still need a road, and families still delay until a child is very sick.",
          prompt: "Why?",
        },
        {
          text: "Health follows water, time, and money. A building is only a building.",
        },
      ],
    };
  }

  return {
    speaker: "Goth Sattar",
    role: "100 families · Tharparkar",
    lines: [
      {
        text: "Click a family, the goat track, the plant pipe, or a building. Nobody will tell you what to construct. They will tell you what their week is.",
      },
    ],
  };
}

export function talkDepth(talk: Talk, depth: number) {
  const max = Math.max(0, talk.lines.length - 1);
  return Math.min(depth, max);
}

export function settleWeek(
  week: number,
  placements: Placement[],
  flags: WorldFlags,
  fired: string[],
): VillageEvent | null {
  const types = new Set(placements.map((item) => item.type));
  const seen = new Set(fired);

  const candidates: VillageEvent[] = [];
  if (week === 3) {
    candidates.push({
      id: "drought",
      title: "Drought week",
      body: "No cloud. Water demand rises. Tanker queues lengthen. Storage is the only buffer.",
      patch: { drought: true },
    });
  }
  if (week === 5) {
    candidates.push({
      id: "drought-ease",
      title: "A thin shower",
      body: "The drought eases. The aquifer is not full. Habits of walking for water remain.",
      patch: { drought: false },
    });
  }
  if (week === 6) {
    candidates.push({
      id: "harvest",
      title: "Harvest season",
      body: "Workers leave the dhani for wages and harvest. The market thins. Classrooms thin.",
      patch: { harvest: true },
    });
  }
  if (week === 8) {
    candidates.push({
      id: "harvest-end",
      title: "Harvest ends",
      body: "Some return. Some do not. The ones who learned a skill elsewhere may not come back.",
      patch: { harvest: false },
    });
  }
  if (week >= 9 && types.has("solar_farm") && !flags.solarBroken) {
    candidates.push({
      id: "solar-break",
      title: "Solar equipment fails",
      body: "Dust and heat took a controller. Pumps and lights sag until you spend on maintenance.",
      patch: { solarBroken: true },
      repair: "solar",
    });
  }
  if (week >= 4 && types.has("pipeline") && !types.has("house_taps")) {
    candidates.push({
      id: "pipe-partial",
      title: "Pipe laid — courtyards still dry",
      body: "The pipe reaches a tank. Only some households are connected. The rest still walk.",
      patch: { pipelinePartial: true },
    });
  }
  if (week >= 5 && types.has("market") && !types.has("skill_center")) {
    candidates.push({
      id: "market-skills",
      title: "Market opened",
      body: "Stalls are up. There are not enough skilled workers to run businesses. Shade is not a job.",
      patch: {},
    });
  }
  if (week >= 4 && types.has("school")) {
    candidates.push({
      id: "school-empty",
      title: "School report",
      body: "The classroom exists. Attendance this week is far below what a building promised.",
      patch: {},
    });
  }

  return candidates.find((item) => !seen.has(item.id)) ?? null;
}

export function reflect(
  village: Village,
  result: SimResult,
  facts: Partial<Record<TopicId, number>>,
): {
  lines: string[];
  unresolved: string;
  prompt: string;
} {
  const d = result.derived;
  const deltas: { label: string; start: number; now: number; key: string }[] = [
    { key: "water", label: "water access", start: village.waterAccess, now: d.waterAccess },
    { key: "jobs", label: "employment", start: village.employmentRate, now: d.employmentRate },
    { key: "income", label: "household income", start: village.averageIncome / 500, now: d.averageIncome / 500 },
    { key: "school", label: "school attendance", start: village.schoolAttendance, now: d.weeklySchoolAttendance },
    { key: "health", label: "health access", start: village.healthAccess, now: d.healthAccess },
    { key: "power", label: "electricity", start: village.electricityAccess, now: d.electricityAccess },
  ];

  const lines = [
    `You improved water access from ${Math.round(village.waterAccess)}% → ${Math.round(d.waterAccess)}%.`,
    Math.abs(d.averageIncome - village.averageIncome) < 1500
      ? "Household income barely changed."
      : `Household income moved from Rs ${village.averageIncome.toLocaleString("en-IN")} → Rs ${d.averageIncome.toLocaleString("en-IN")}.`,
    `School this week: ${Math.round(d.weeklySchoolAttendance)}% attended. Child labour still about ${Math.round(d.childLabor)}%.`,
    `You spent Rs ${result.spent.toLocaleString("en-IN")} of Rs ${village.budget.toLocaleString("en-IN")}.`,
  ];

  const stuck = [...deltas].sort(
    (a, b) => Math.abs(a.now - a.start) - Math.abs(b.now - b.start),
  )[0];
  const unresolved = `Your biggest unresolved problem appears to be ${stuck.label}.`;
  const investigated = Object.keys(facts).length;
  const prompt =
    investigated < 3
      ? "You built more than you asked. What would you investigate next?"
      : "What would you investigate next — and why did you spend where you spent?";

  return { lines, unresolved, prompt };
}

export function nearbyCluster(point: { x: number; y: number }) {
  return CLUSTERS.find((item) => Math.hypot(item.cx - point.x, item.cy - point.y) < 90);
}
