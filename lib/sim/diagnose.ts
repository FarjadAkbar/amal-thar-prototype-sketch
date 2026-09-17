import { interventionOf } from "./catalog";
import { dist } from "./format";
import { BAZAAR, CLUSTERS, distToPolyline } from "./mapLayout";
import type { Diagnosis, Grade, Placement, SimResult } from "./types";

export function pipeFeedsWell(well: Placement, pipe: Placement) {
  if (pipe.type !== "pipeline") return false;
  if (pipe.fromId === well.id) return true;
  return dist(well, pipe) <= 90;
}

function liveOf(type: Placement["type"], placements: Placement[], result: SimResult) {
  return placements.filter(
    (item) => item.type === type && result.functionalIds.includes(item.id),
  );
}

function gradeOf(grade: Grade, rest: Omit<Diagnosis, "grade">): Diagnosis {
  return { grade, ...rest };
}

export function diagnosePlacement(
  placement: Placement,
  placements: Placement[],
  result: SimResult,
): Diagnosis {
  const def = interventionOf(placement.type);
  const idle = result.inactive.find((item) => item.id === placement.id);
  const wells = placements.filter((item) => item.type === "well");
  const pipes = liveOf("pipeline", placements, result);

  if (idle) {
    const missing = idle.missing.join(", ");
    if (placement.type === "pipeline") {
      return gradeOf("idle", {
        title: "Well-to-tank pipe",
        headline: "A pipe with no tank is just buried iron.",
        why: [
          "This does not connect to a city main. Thar has no tap-water network.",
          "The pipe only moves aquifer water from a well into a tank.",
          missing ? `Still missing: ${missing}.` : "Add a ground tank or elevated tank.",
        ],
        next: ["Place a tank, then: Pipe tool → well → tank."],
      });
    }
    if (placement.type === "market") {
      return gradeOf("idle", {
        title: "Market stall",
        headline: "A bazaar in loose sand is just shade.",
        why: [
          "Pickup trucks and animal carts high-centre on the goat path.",
          "Traders will not come until the track to town is packed.",
        ],
        next: ["Build the bazaar road — the faded track toward Mithi / Islamkot."],
      });
    }
    if (placement.type === "solar_pump") {
      return gradeOf("idle", {
        title: "Solar pump",
        headline: "A pump with nothing to lift, or no power to spin.",
        why: idle.missing.map((item) => `Needs ${item}.`),
        next: ["Place it next to a well, and build a solar farm first."],
      });
    }
    if (placement.type === "water_tank") {
      return gradeOf("idle", {
        title: "Ground tank",
        headline: "The round tank is empty because no well feeds it.",
        why: ["The tank holds aquifer water you lifted from a well — not municipal tap water."],
        next: ["Put the tank beside a well. A pump makes filling it realistic."],
      });
    }
    if (placement.type === "house_taps") {
      return gradeOf("idle", {
        title: "Shared courtyard tap",
        headline: "A standpipe with no tank is just a dry pipe.",
        why: [
          "This is not indoor plumbing. Thar homes do not have tap water.",
          "The standpipe only runs if a courtyard tank or elevated tank can feed it.",
        ],
        next: ["Place a ground tank or elevated tank first."],
      });
    }
    return gradeOf("idle", {
      title: def.name,
      headline: `Built, but not working. Needs ${missing}.`,
      why: [`This stays unused until its chain exists: ${missing}.`],
      next: [`Add ${missing}, then click this again.`],
    });
  }

  if (placement.type === "well") {
    const piped = pipes.some((pipe) => pipeFeedsWell(placement, pipe));
    const pumped = liveOf("solar_pump", placements, result).some(
      (item) => dist(item, placement) <= 120,
    );
    const stored =
      liveOf("water_tank", placements, result).some((item) => dist(item, placement) <= 140) ||
      liveOf("elevated_tank", placements, result).some((item) => dist(item, placement) <= 140);
    const treated =
      liveOf("solar_still", placements, result).some((item) => dist(item, placement) <= 140) ||
      liveOf("clay_filter", placements, result).some((item) => dist(item, placement) <= 140);

    if (!pumped && !stored && !treated) {
      return gradeOf("weak", {
        title: "Well",
        headline: "It drinks the aquifer — monsoon rain that seeped deep underground. Not a tap.",
        why: [
          "Water does not arrive in a pipe from town. It seeps into rock and sand after rain, then you lift it.",
          "In Thar that water is often deep, seasonal, and brackish. Households do not have tap water.",
          "Without a pump, a tank, or a still, this is still a rope, a bucket, and a long walk.",
        ],
        next: [
          "Lift: solar pump (needs solar).",
          "Store: ground tank or elevated tank.",
          "If it tastes of salt: solar still + clay filter.",
        ],
      });
    }
    if (!treated || !stored) {
      return gradeOf("working", {
        title: "Well",
        headline: "Aquifer water can be lifted. It is still not household tap water.",
        why: [
          pumped
            ? "The pump is lifting groundwater from the monsoon-fed aquifer."
            : "You are still lifting by hand — the water table is deep.",
          stored
            ? "A tank holds a few days so people are not queuing at dawn."
            : "No tank: whatever you lift is used immediately.",
          treated
            ? "Still/filter is making brackish water safer to drink."
            : "Untreated Thar groundwater is often too salty or hard for drinking.",
        ],
        next: [
          !pumped ? "Add a solar pump." : "",
          !stored ? "Add a tank. Pipe well → tank if they are apart." : "",
          !treated ? "Add a solar still and a clay filter for drinking." : "",
        ].filter(Boolean),
      });
    }
    return gradeOf("strong", {
      title: "Well",
      headline: "Aquifer → lift → store → treat. Still not taps in every room.",
      why: [
        "Monsoon seepage feeds the aquifer. The well taps it. Pump, tank, and still make it usable.",
        piped
          ? "A well-to-tank pipe saves the bucket walk inside the compound."
          : "A pipe from this well into the tank would save lifting twice.",
      ],
      next: piped
        ? ["A shared courtyard standpipe is the most Thar will look like 'taps'."]
        : ["Pipe this well into the tank."],
    });
  }

  if (placement.type === "pipeline") {
    const well = wells.find((item) => pipeFeedsWell(item, placement));
    const tanks = [
      ...liveOf("water_tank", placements, result),
      ...liveOf("elevated_tank", placements, result),
    ];
    const end =
      placement.x2 != null && placement.y2 != null
        ? { x: placement.x2, y: placement.y2 }
        : placement;
    const tank = tanks.find((item) => dist(item, end) <= 90);
    return gradeOf(well && tank ? "working" : "weak", {
      title: "Well-to-tank pipe",
      headline:
        well && tank
          ? "Aquifer water can move from the well into a tank without a bucket walk."
          : "The pipe is in the sand, but it is not clearly well → tank.",
      why: [
        "This is not a city main. Thar has no tap-water network.",
        well
          ? "One end is on a well that drinks the monsoon aquifer."
          : "Start the pipe on a well — that is the only water source.",
        tank
          ? "The other end reaches a tank, so the compound can store a few days."
          : "Finish on a ground tank or elevated tank.",
      ],
      next:
        well && tank
          ? ["A shared courtyard standpipe is the most this will look like taps."]
          : ["Pipe tool: well first, then a tank."],
    });
  }

  if (placement.type === "main_water_line") {
    return gradeOf("working", {
      title: "RO drinking kiosk",
      headline: "People walk here with cans. This is not tap water in the chaunras.",
      why: [
        "A communal drinking point treats and sells or shares water.",
        "It does not fill wells. Wells still drink the aquifer: monsoon rain that seeped underground.",
        "Thar households do not have a tap-water network.",
      ],
      next: ["Dig a well if you want groundwater. Pipe that well into a tank, not into this kiosk."],
    });
  }

  if (placement.type === "road") {
    const markets = liveOf("market", placements, result);
    return gradeOf(markets.length ? "strong" : "working", {
      title: "Bazaar road",
      headline: "The goat path is packed. Carts and pickups can leave the dhani.",
      why: [
        "A road is not decoration. It is how milk, goats, patients, and teachers move.",
        "Until this exists, a market is theatre.",
      ],
      next: markets.length
        ? ["Add a livestock center on the same track for better sale prices."]
        : ["Place the market ON this track, not in deep sand."],
    });
  }

  if (placement.type === "market") {
    const onTrack = distToPolyline(BAZAAR, placement) < 70;
    if (!onTrack) {
      return gradeOf("weak", {
        title: "Market",
        headline: "The road exists, but this stall is still a walk across sand.",
        why: [
          "People follow the packed track. A market off it loses traders.",
        ],
        next: ["Remove it and place the market on the bazaar road."],
      });
    }
    const livestock = liveOf("livestock_center", placements, result).some(
      (item) => dist(item, placement) <= 260,
    );
    return gradeOf(livestock ? "strong" : "working", {
      title: "Market",
      headline: livestock
        ? "On the road, with livestock nearby — prices can actually form."
        : "On the bazaar road. Traders can arrive.",
      why: [
        "Road + stall is the minimum market.",
        livestock
          ? "Animals reach a paying buyer instead of a distress sale at the gate."
          : "Without a livestock center, herds still sell cheap to whoever shows up.",
      ],
      next: livestock ? [] : ["Add a livestock center along the same road."],
    });
  }

  if (placement.type === "water_tank") {
    const well = wells.find((item) => dist(item, placement) <= 140);
    const piped = well
      ? pipes.some((pipe) => pipeFeedsWell(well, pipe))
      : false;
    const pumped = well
      ? liveOf("solar_pump", placements, result).some((item) => dist(item, well) <= 120)
      : false;
    return gradeOf(piped || pumped ? "strong" : "working", {
      title: "Ground tank",
      headline:
        "The courtyard tank stores aquifer water lifted from a well — not tap water from a main.",
      why: [
        well
          ? "The nearby well drinks monsoon seepage in the rock and sand."
          : "A tank cannot invent water. It only holds what a well lifts.",
        piped
          ? "A well-to-tank pipe saves the bucket walk inside the compound."
          : "Without a pipe, people still carry water from the well to this tank.",
      ],
      next: piped
        ? ["A shared courtyard standpipe is as close as Thar gets to taps."]
        : ["Pipe the well into this tank, or add a solar pump to lift faster."],
    });
  }

  if (placement.type === "solar_still") {
    const well = wells.find((item) => dist(item, placement) <= 140);
    return gradeOf(well ? "working" : "weak", {
      title: "Solar still",
      headline: well
        ? "Sun is distilling brackish well water. Slow, safe, no grid."
        : "The glass box is empty. It needs brackish feed from a well (or a bucket).",
      why: [
        "Thar groundwater is often too salty to drink raw.",
        well
          ? "This is the low-budget student path: evaporate, condense, store."
          : "Manual fill works, but a well next to it is the real inlet.",
      ],
      next: well
        ? ["Add a clay filter and a covered tank for safe storage."]
        : ["Place it beside a well."],
    });
  }

  if (placement.type === "elevated_tank") {
    const pumped = liveOf("solar_pump", placements, result).some(
      (item) => dist(item, placement) <= 160,
    );
    const standpipe = liveOf("house_taps", placements, result).length > 0;
    return gradeOf(pumped && standpipe ? "strong" : "working", {
      title: "Elevated tank",
      headline: pumped
        ? "Gravity can feed a shared courtyard standpipe — not indoor taps."
        : "The tower is up. Without a pump, filling it is buckets from the well.",
      why: [
        "This stores aquifer water you already lifted. It is not a municipal tower.",
        "Thar homes do not have tap water. A courtyard point is the last metre.",
      ],
      next: [
        !pumped ? "Add a solar pump at the well." : "",
        !standpipe ? "Add a shared courtyard tap on a compound." : "",
      ].filter(Boolean),
    });
  }

  if (placement.type === "house_taps") {
    return gradeOf("working", {
      title: "Shared courtyard tap",
      headline: "One standpipe in the courtyard. Not tap water in every room.",
      why: [
        "People still walk to this point with pots. That is how water is shared in a Thar compound.",
        "The feed is your tank — aquifer water lifted from a well, not a city main.",
      ],
      next: ["A clay filter here makes it safer to drink, especially if the well is brackish."],
    });
  }

  if (placement.type === "clay_filter") {
    const still = liveOf("solar_still", placements, result).some(
      (item) => dist(item, placement) <= 160,
    );
    return gradeOf(still ? "strong" : "working", {
      title: "Clay / charcoal filter",
      headline: still
        ? "Still + clay pots: drinkable water with no electricity."
        : "Pots and charcoal cut turbidity. They do not desalinate brackish water.",
      why: [
        still
          ? "Distill first, then filter — that is the off-grid drinking chain."
          : "Pair with a solar still if the well is brackish.",
      ],
      next: still ? [] : ["Place a solar still nearby if the well is brackish."],
    });
  }

  if (placement.type === "demo_house") {
    return gradeOf("working", {
      title: "Student demo house",
      headline: "One teaching dwelling: green roof, rooftop solar, rain, indoor filter.",
      why: [
        "It will not water the whole dhani. It shows a bundle other households can copy.",
      ],
      next: ["Add rainwater and a clay filter beside it to complete the prototype."],
    });
  }

  if (placement.type === "skill_center") {
    const net = liveOf("internet_tower", placements, result).length > 0;
    return gradeOf(net ? "strong" : "working", {
      title: def.name,
      headline: net
        ? "Power, road, and a tower — training can become remote work."
        : "The room has light. It still has no jobs at the other end of the wire.",
      why: net
        ? ["Skills + internet is the digital employment chain."]
        : ["A skill center without connectivity trains people for a town they cannot reach."],
      next: net ? [] : ["Add an internet tower (it needs power)."],
    });
  }

  return gradeOf("working", {
    title: def.name,
    headline: `${def.name} is live and feeding the village systems.`,
    why: [def.description],
    next: [],
  });
}

export function diagnoseLandmark(
  id: string,
  placements: Placement[],
  result: SimResult,
): Diagnosis {
  const roadLive = liveOf("road", placements, result).length > 0;
  const workingWell = placements.some(
    (well) =>
      well.type === "well" &&
      result.functionalIds.includes(well.id) &&
      (liveOf("solar_pump", placements, result).some((item) => dist(item, well) <= 120) ||
        liveOf("water_tank", placements, result).some((item) => dist(item, well) <= 140) ||
        liveOf("elevated_tank", placements, result).some((item) => dist(item, well) <= 140) ||
        liveOf("solar_still", placements, result).some((item) => dist(item, well) <= 140)),
  );

  if (id === "plant") {
    return gradeOf("working", {
      title: "Thar coal / industrial scheme",
      headline: "The plant uses water. That is not tap water for the chaunras.",
      why: [
        "Industry has process water. Households do not have a tap-water network.",
        "Village wells fill from the aquifer: monsoon rain that seeped deep into rock and sand.",
      ],
      next: ["Dig a well by a compound. Then lift, store, and if it is salty, distill."],
    });
  }

  if (id === "trunk" || id === "valve") {
    return gradeOf("idle", {
      title: "Plant process water",
      headline: "This trunk does not fill village wells. Thar has no tap-water network.",
      why: [
        "The buried line carries industrial water at the plant. It is not a municipal main.",
        "Wells drink an aquifer recharged by seasonal monsoon seepage, not this pipe.",
      ],
      next: ["Leave the trunk alone. Dig a well, then pipe well → tank if you want storage."],
    });
  }

  if (id === "bazaar") {
    return gradeOf(roadLive ? "working" : "idle", {
      title: roadLive ? "Bazaar road" : "Goat track to town",
      headline: roadLive
        ? "Packed enough for carts and pickups."
        : "This is how goats leave. It is not yet how a market works.",
      why: [
        "Roads in Thar are for reaching Mithi / Islamkot, not for looping a village like a toy city.",
        "School, clinic, and market all wait on this one corridor.",
      ],
      next: roadLive
        ? ["Place the market on this track."]
        : ["Choose Bazaar road, then click this faded path."],
    });
  }

  const cluster = CLUSTERS.find((item) => item.id === id);
  if (cluster) {
    const nearbyWell = placements.some(
      (well) =>
        well.type === "well" &&
        result.functionalIds.includes(well.id) &&
        Math.hypot(well.x - cluster.cx, well.y - cluster.cy) <= 160,
    );
    return gradeOf(workingWell && nearbyWell ? "working" : "weak", {
      title: cluster.name,
      headline: nearbyWell
        ? "A well here drinks the monsoon aquifer. People still lift by bucket unless you store it."
        : cluster.note,
      why: [
        "These are chaunras and compound walls — not generic houses, and not tap-water homes.",
        nearbyWell
          ? "Groundwater is in the well. A tank and pump turn that into daily supply."
          : "Without a well, this compound still walks for tanker water. Rain that seeps underground is the source — not a city pipe.",
      ],
      next: nearbyWell
        ? ["Add a round tank, then pipe well → tank. A shared courtyard tap is optional."]
        : ["Dig a well near the compound. It fills from the aquifer, not from the plant trunk."],
    });
  }

  return gradeOf("idle", {
    title: "Goth Sattar",
    headline: "Click a well or a compound. Wells drink the aquifer, not a tap main.",
    why: [],
    next: [],
  });
}
