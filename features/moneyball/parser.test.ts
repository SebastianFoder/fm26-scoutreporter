import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MoneyballStat } from "./moneyball-stat";
import { parseMoneyballCsv } from "./parser";

const FIXTURE = join(process.cwd(), "fixtures", "mustermann.csv");

test("parseMoneyballCsv parses mustermann fixture rows", () => {
  const parsed = parseMoneyballCsv(readFileSync(FIXTURE, "utf8"));
  assert.equal(parsed.errors.length, 0);
  assert.ok(parsed.rows.length > 0);
  assert.ok(parsed.statKeys.includes(MoneyballStat.ShotsPer90));
  assert.ok(parsed.statKeys.includes(MoneyballStat.KeyPassesPer90));
  assert.ok(parsed.statKeys.includes(MoneyballStat.TacklesAttempted));
  assert.ok(parsed.statKeys.includes(MoneyballStat.HeadersAttemptedPer90));
  assert.ok(parsed.statKeys.includes(MoneyballStat.OffsidesPer90));
  const first = parsed.rows[0];
  assert.ok(typeof first.bestPos === "string");
  assert.ok(typeof first.askingPrice === "string");
});

const CSV_UNKNOWN_STAT = `Inf;Player;Unique ID;Minutes;Mins/Gm;Appearances;Based In;Division;Nation;Club;Position;Age;Potential;Wage;Best Pos;Asking Price;Shot/90;KP/90;Tck A;Hdrs A;Off;NotARealStat
;John Doe;123;900;90;10;England;Premier League;ENG;Test FC;D (C);25;Good;€10K p/w;D (C);€5M;1.1;0.4;15;20;3;0`;

test("parseMoneyballCsv errors on unknown stat column", () => {
  const parsed = parseMoneyballCsv(CSV_UNKNOWN_STAT);
  assert.ok(parsed.errors.some((e) => e.message.includes("Unknown stat column")));
  assert.equal(parsed.rows.length, 0);
  assert.equal(parsed.statKeys.length, 0);
});
