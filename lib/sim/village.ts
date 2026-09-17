import type { Village, World } from "./types";

/** Fictional but Thar-like hamlet. Numbers are prototype assumptions. */
export const QUIET_WORLD: World = {
  flags: {
    drought: false,
    harvest: false,
    solarBroken: false,
    pipelinePartial: false,
  },
  extraSpend: 0,
};

export const GOTH_SATTAR: Village = {
  name: "Goth Sattar",
  district: "Tharparkar",
  population: 620,
  families: 100,
  livestock: 850,
  budget: 1_000_000,
  povertyRate: 72,
  waterAccess: 31,
  electricityAccess: 18,
  employmentRate: 28,
  schoolAttendance: 54,
  healthAccess: 35,
  averageIncome: 18_000,
  livestockHealth: 42,
  agricultureProductivity: 30,
};

export const EMPTY_SYSTEMS = {
  waterSource: 0,
  pumping: 0,
  storage: 0,
  energy: 0,
  grid: 0,
  roads: 0,
  markets: 0,
  digital: 0,
  skills: 0,
  healthServices: 0,
  education: 0,
  livestockSupport: 0,
  finance: 0,
  processing: 0,
} as const;
