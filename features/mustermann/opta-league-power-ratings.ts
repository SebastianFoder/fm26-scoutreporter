/**
 * Opta Analyst-style league average team Power Ratings (top 30 leagues).
 * Used to seed Mustermann Opta league strength; values are on a ~65–95 scale.
 */

export type OptaLeagueRule = {
  countries: string[];
  divisionMatch: "equals" | "includes";
  division: string;
  powerRating: number;
  priority: number;
};

export const OPTA_LEAGUE_RULES: OptaLeagueRule[] = [
  { countries: ["england"], divisionMatch: "includes", division: "premier league", powerRating: 92.6, priority: 100 },
  { countries: ["italy"], divisionMatch: "includes", division: "serie a", powerRating: 87, priority: 95 },
  { countries: ["italy"], divisionMatch: "includes", division: "serie b", powerRating: 76.4, priority: 94 },
  { countries: ["spain"], divisionMatch: "equals", division: "first division", powerRating: 87, priority: 93 },
  { countries: ["spain"], divisionMatch: "includes", division: "segunda", powerRating: 76.2, priority: 92 },
  { countries: ["germany"], divisionMatch: "includes", division: "bundesliga", powerRating: 86.3, priority: 91 },
  { countries: ["germany"], divisionMatch: "includes", division: "zwei", powerRating: 76.2, priority: 90 },
  { countries: ["germany"], divisionMatch: "includes", division: "2. bundesliga", powerRating: 76.2, priority: 89 },
  { countries: ["germany"], divisionMatch: "includes", division: "2 bundesliga", powerRating: 76.2, priority: 89 },
  { countries: ["france"], divisionMatch: "includes", division: "ligue 1", powerRating: 85.5, priority: 88 },
  { countries: ["england"], divisionMatch: "includes", division: "championship", powerRating: 80.9, priority: 87 },
  { countries: ["belgium"], divisionMatch: "includes", division: "pro league", powerRating: 80.5, priority: 86 },
  { countries: ["belgium"], divisionMatch: "includes", division: "jupiler", powerRating: 80.5, priority: 86 },
  { countries: ["portugal"], divisionMatch: "includes", division: "premier league", powerRating: 79.8, priority: 85 },
  { countries: ["brazil"], divisionMatch: "includes", division: "serie a", powerRating: 79.4, priority: 84 },
  { countries: ["netherlands", "holland"], divisionMatch: "includes", division: "eredivisie", powerRating: 78.8, priority: 83 },
  { countries: ["argentina"], divisionMatch: "includes", division: "liga profesional", powerRating: 78.6, priority: 82 },
  { countries: ["argentina"], divisionMatch: "includes", division: "primera division", powerRating: 78.6, priority: 81 },
  { countries: ["usa", "united states"], divisionMatch: "includes", division: "mls", powerRating: 78.5, priority: 80 },
  { countries: ["usa", "united states"], divisionMatch: "includes", division: "major league soccer", powerRating: 78.5, priority: 80 },
  { countries: ["mexico"], divisionMatch: "includes", division: "liga mx", powerRating: 78.5, priority: 79 },
  { countries: ["mexico"], divisionMatch: "includes", division: "liga bbva", powerRating: 78.5, priority: 78 },
  { countries: ["japan"], divisionMatch: "includes", division: "j1", powerRating: 77.9, priority: 77 },
  { countries: ["japan"], divisionMatch: "includes", division: "j league", powerRating: 77.9, priority: 76 },
  { countries: ["croatia"], divisionMatch: "includes", division: "hnl", powerRating: 77.8, priority: 75 },
  { countries: ["croatia"], divisionMatch: "includes", division: "prva", powerRating: 77.8, priority: 75 },
  { countries: ["poland"], divisionMatch: "includes", division: "ekstraklasa", powerRating: 77.6, priority: 74 },
  { countries: ["denmark"], divisionMatch: "includes", division: "superliga", powerRating: 77.6, priority: 73 },
  { countries: ["sweden"], divisionMatch: "includes", division: "allsvenskan", powerRating: 76.3, priority: 72 },
  { countries: ["turkey", "türkiye", "turkiye"], divisionMatch: "includes", division: "super lig", powerRating: 76.2, priority: 71 },
  { countries: ["russia"], divisionMatch: "includes", division: "premier league", powerRating: 76.1, priority: 70 },
  { countries: ["austria"], divisionMatch: "includes", division: "bundesliga", powerRating: 76.1, priority: 69 },
  { countries: ["switzerland"], divisionMatch: "includes", division: "super league", powerRating: 76.1, priority: 68 },
  { countries: ["norway"], divisionMatch: "includes", division: "eliteserien", powerRating: 75.9, priority: 67 },
  { countries: ["czech republic", "czechia"], divisionMatch: "includes", division: "first league", powerRating: 75.5, priority: 66 },
  { countries: ["czech republic", "czechia"], divisionMatch: "includes", division: "fortuna liga", powerRating: 75.5, priority: 66 },
  { countries: ["ecuador"], divisionMatch: "includes", division: "liga pro", powerRating: 75.3, priority: 65 },
  { countries: ["saudi arabia"], divisionMatch: "includes", division: "pro league", powerRating: 75.1, priority: 64 },
  { countries: ["saudi arabia"], divisionMatch: "includes", division: "saudi", powerRating: 75.1, priority: 63 },
  { countries: ["hungary"], divisionMatch: "includes", division: "nb i", powerRating: 75, priority: 62 },
  { countries: ["hungary"], divisionMatch: "includes", division: "otp bank liga", powerRating: 75, priority: 62 },
];

export const OPTA_LEAGUE_RULES_SORTED: OptaLeagueRule[] = [...OPTA_LEAGUE_RULES].sort(
  (a, b) => b.priority - a.priority,
);

const GERMAN_SECOND_TIER_HINTS = ["zwei", "2.", "2 ", "ii", "second"];

function isGermanSecondTierBundesliga(normDivision: string): boolean {
  const d = normDivision;
  if (d.includes("zwei") || d.includes("2.bundesliga") || d.includes("2 bundesliga")) return true;
  if (d.startsWith("2.") && d.includes("bundesliga")) return true;
  return GERMAN_SECOND_TIER_HINTS.some((h) => h !== "2." && d.includes(h) && d.includes("bundesliga"));
}

export function normalizeLeagueText(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['']/g, "")
    .replace(/\s+/g, " ");
}

function countryMatches(ruleCountries: string[], normCountry: string): boolean {
  if (ruleCountries.length === 0) return true;
  return ruleCountries.some((c) => normCountry === c || normCountry.includes(c) || c.includes(normCountry));
}

function divisionMatches(rule: OptaLeagueRule, normDivision: string): boolean {
  if (rule.divisionMatch === "equals") return normDivision === rule.division;
  return normDivision.includes(rule.division);
}

export function lookupPowerRating(basedIn: string, division: string): number | null {
  const normCountry = normalizeLeagueText(basedIn);
  const normDivision = normalizeLeagueText(division);
  if (!normDivision) return null;
  if (normCountry === "germany" && normDivision.includes("bundesliga") && isGermanSecondTierBundesliga(normDivision)) {
    return 76.2;
  }
  for (const rule of OPTA_LEAGUE_RULES_SORTED) {
    if (!countryMatches(rule.countries, normCountry)) continue;
    if (!divisionMatches(rule, normDivision)) continue;
    if (normCountry === "germany" && rule.division === "bundesliga" && isGermanSecondTierBundesliga(normDivision)) continue;
    return rule.powerRating;
  }
  return null;
}
