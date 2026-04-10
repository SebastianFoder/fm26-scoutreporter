import test from "node:test";
import assert from "node:assert/strict";
import { lookupPowerRating, normalizeLeagueText, OPTA_LEAGUE_RULES } from "./opta-league-power-ratings";

test("normalizeLeagueText folds case and accents", () => {
  assert.equal(normalizeLeagueText("  Ligue 1 McDonald's  "), "ligue 1 mcdonalds");
});

test("lookupPowerRating matches mustermann.csv division pairs", () => {
  assert.equal(lookupPowerRating("England", "Premier League"), 92.6);
  assert.equal(lookupPowerRating("Portugal", "Premier League"), 79.8);
});

test("lookupPowerRating returns null for unknown league", () => {
  assert.equal(lookupPowerRating("Scotland", "Premiership"), null);
});

test("OPTA_LEAGUE_RULES covers chart leagues with alias rules", () => {
  assert.ok(OPTA_LEAGUE_RULES.length >= 30);
});
