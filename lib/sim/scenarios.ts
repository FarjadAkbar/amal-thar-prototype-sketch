import type { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
  {
    id: "water_crisis",
    name: "Water crisis",
    blurb: "Availability drops 20%. Wells, pumping, and storage blunt the shock — not a tap main.",
    hint: "Well + tank + solar pump (pipe well → tank if they are apart)",
  },
  {
    id: "livestock_prices",
    name: "Livestock prices fall",
    blurb: "Herd income collapses unless animals can reach a better market.",
    hint: "Road + livestock center + market",
  },
  {
    id: "youth_unemployment",
    name: "Youth unemployment",
    blurb: "Local jobs dry up. Skills only pay if power and connectivity exist.",
    hint: "Solar + internet + skill center",
  },
];

export function scenarioById(id: string | null) {
  return SCENARIOS.find((s) => s.id === id) ?? null;
}
