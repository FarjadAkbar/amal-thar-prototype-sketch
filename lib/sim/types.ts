export type InterventionType =
  | "well"
  | "pipeline"
  | "main_water_line"
  | "water_tank"
  | "rainwater"
  | "solar_farm"
  | "solar_pump"
  | "battery"
  | "distribution_line"
  | "market"
  | "livestock_center"
  | "processing_unit"
  | "microfinance"
  | "school"
  | "skill_center"
  | "clinic"
  | "road"
  | "internet_tower"
  | "solar_still"
  | "elevated_tank"
  | "house_taps"
  | "clay_filter"
  | "demo_house";

export type Category =
  | "water"
  | "energy"
  | "economy"
  | "human"
  | "connectivity";

export type Requirement = {
  type: InterventionType;
  /** If set, the required building must be this close on the map. */
  maxDist?: number;
};

export type Systems = {
  waterSource: number;
  pumping: number;
  storage: number;
  energy: number;
  grid: number;
  roads: number;
  markets: number;
  digital: number;
  skills: number;
  healthServices: number;
  education: number;
  livestockSupport: number;
  finance: number;
  processing: number;
};

export type Village = {
  name: string;
  district: string;
  population: number;
  families: number;
  livestock: number;
  budget: number;
  povertyRate: number;
  waterAccess: number;
  electricityAccess: number;
  employmentRate: number;
  schoolAttendance: number;
  healthAccess: number;
  averageIncome: number;
  livestockHealth: number;
  agricultureProductivity: number;
};

export type WorldFlags = {
  drought: boolean;
  harvest: boolean;
  solarBroken: boolean;
  pipelinePartial: boolean;
};

export type World = {
  flags: WorldFlags;
  extraSpend: number;
};

export type BuildMode = "stamp" | "connect" | "unlock";

export type Placement = {
  id: string;
  type: InterventionType;
  x: number;
  y: number;
  /** Other end of a pipe or track. */
  x2?: number;
  y2?: number;
  /** Well (or other node) this pipe starts from. */
  fromId?: string;
  /** Tank this pipe ends at. */
  toId?: string;
  /** Student's reason for placing this here. */
  comment?: string;
};

export type Grade = "idle" | "weak" | "working" | "strong";

export type Diagnosis = {
  grade: Grade;
  title: string;
  headline: string;
  why: string[];
  next: string[];
};

export type Intervention = {
  type: InterventionType;
  name: string;
  shortName: string;
  icon: string;
  category: Category;
  cost: number;
  description: string;
  requires: Requirement[];
  requiresAny?: Requirement[];
  unique?: boolean;
  mode?: BuildMode;
  howTo: string;
  effects: Partial<Systems>;
};

export type Synergy = {
  id: string;
  label: string;
  why: string;
  a: Requirement;
  b: Requirement;
  effects: Partial<Systems>;
};

export type ObservedProblem = {
  id: string;
  title: string;
  note: string;
};

export type ScenarioId = "water_crisis" | "livestock_prices" | "youth_unemployment";

export type Scenario = {
  id: ScenarioId;
  name: string;
  blurb: string;
  hint: string;
};

export type PovertyDriver = {
  key: string;
  title: string;
  detail: string;
  points: number;
};

export type Dimensions = {
  income: number;
  water: number;
  education: number;
  health: number;
  employment: number;
  energy: number;
};

export type Derived = {
  waterAccess: number;
  electricityAccess: number;
  employmentRate: number;
  schoolAttendance: number;
  healthAccess: number;
  averageIncome: number;
  livestockHealth: number;
  agricultureProductivity: number;
  povertyRate: number;
  jobs: number;
  developmentIndex: number;
  dimensions: Dimensions;
  childLabor: number;
  waterHours: number;
  connectedShare: number;
  weeklySchoolAttendance: number;
  skilledShare: number;
};

export type InactivePlacement = {
  id: string;
  type: InterventionType;
  missing: string[];
};

export type ActiveSynergy = {
  id: string;
  label: string;
  why: string;
};

export type SimResult = {
  systems: Systems;
  derived: Derived;
  functionalIds: string[];
  inactive: InactivePlacement[];
  synergies: ActiveSynergy[];
  drivers: PovertyDriver[];
  spent: number;
  budgetRemaining: number;
};
