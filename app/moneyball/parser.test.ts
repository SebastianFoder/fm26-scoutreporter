import test from "node:test";
import assert from "node:assert/strict";
import { MoneyballStat } from "./moneyball-stat";
import { parseMoneyballCsv } from "./parser";

const CSV = `Inf;Player;Unique ID;MLG;Con/90;Cln/90;xGP/90;Minutes;Mins/Gm;Appearances;Based In;Division;Nation;Club;Position;Age;Potential;Wage
;John Doe;123;1;0.5;0.2;0.3;900;90;10;England;Premier League;ENG;Test FC;D (C);25;Good;€10K p/w`;

test("parseMoneyballCsv parses valid rows", () => {
  const parsed = parseMoneyballCsv(CSV);
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].uniqueId, "123");
  assert.equal(parsed.rows[0].stats[MoneyballStat.MistakesLeadingToGoal], 1);
});

const CSV_UNKNOWN_STAT = `Inf;Player;Unique ID;NotARealStat;Minutes;Mins/Gm;Appearances;Based In;Division;Nation;Club;Position;Age;Potential;Wage
;;1;0;900;90;10;;;;;;;D (C);25;Good;€0`;

test("parseMoneyballCsv errors on unknown stat column", () => {
  const parsed = parseMoneyballCsv(CSV_UNKNOWN_STAT);
  assert.ok(parsed.errors.some((e) => e.message.includes("Unknown stat column")));
  assert.equal(parsed.rows.length, 0);
  assert.equal(parsed.statKeys.length, 0);
});
