export const CHAINS = [
  {
    id: "water",
    name: "Water",
    outcome: "Stop the tanker walk",
    steps: [
      { type: "well" as const, label: "Well" },
      { type: "solar_pump" as const, label: "Pump" },
      { type: "water_tank" as const, label: "Tank" },
      { type: "pipeline" as const, label: "Pipe" },
    ],
  },
  {
    id: "offgrid",
    name: "Off-grid drinking",
    outcome: "Safe water without a grid or a kiosk",
    steps: [
      { type: "well" as const, label: "Well" },
      { type: "solar_still" as const, label: "Still" },
      { type: "clay_filter" as const, label: "Filter" },
      { type: "elevated_tank" as const, label: "Tower" },
    ],
  },
  {
    id: "energy",
    name: "Energy",
    outcome: "Pumps, lights, digital work",
    steps: [
      { type: "solar_farm" as const, label: "Solar" },
      { type: "distribution_line" as const, label: "Grid" },
      { type: "solar_pump" as const, label: "Pump" },
    ],
  },
  {
    id: "economy",
    name: "Economy",
    outcome: "Prices, income, jobs",
    steps: [
      { type: "road" as const, label: "Road" },
      { type: "market" as const, label: "Market" },
      { type: "livestock_center" as const, label: "Livestock" },
    ],
  },
  {
    id: "digital",
    name: "Digital work",
    outcome: "Remote jobs, household income",
    steps: [
      { type: "solar_farm" as const, label: "Solar" },
      { type: "internet_tower" as const, label: "Internet" },
      { type: "skill_center" as const, label: "Skills" },
    ],
  },
];
