import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MoneyballStat } from "./moneyball-stat";
import { parseMustermannMoneyballCsv } from "./parser";

const FIXTURE = join(process.cwd(), "fixtures", "mustermann.csv");

test("parseMustermannMoneyballCsv parses fixture without errors", () => {
  const csv = readFileSync(FIXTURE, "utf8");
  const parsed = parseMustermannMoneyballCsv(csv);
  assert.equal(parsed.errors.length, 0, parsed.errors.map((e) => e.message).join("; "));
  assert.ok(parsed.rows.length > 0);
  assert.ok(parsed.statKeys.includes(MoneyballStat.HeadersAttemptedPer90));
  assert.ok(parsed.statKeys.includes(MoneyballStat.OffsidesPer90));
  assert.ok(parsed.statKeys.includes(MoneyballStat.ShotsPer90));
  assert.ok(parsed.statKeys.includes(MoneyballStat.KeyPassesPer90));
  assert.ok(parsed.statKeys.includes(MoneyballStat.TacklesAttempted));
  assert.ok(parsed.statKeys.includes(MoneyballStat.HeadersAttempted));
  assert.equal(parsed.statKeys.some((k) => String(k) === "Off"), false);
});

test("parseMustermannMoneyballCsv derives HeadersAttemptedPer90 from Hdrs A and Minutes", () => {
  const csv = readFileSync(FIXTURE, "utf8");
  const parsed = parseMustermannMoneyballCsv(csv);
  const oliver = parsed.rows.find((r) => r.player.includes("Oliver Sorg"));
  assert.ok(oliver);
  assert.equal(oliver.minutes, 3536);
  const expected = (92 / 3536) * 90;
  assert.ok(Math.abs((oliver.stats[MoneyballStat.HeadersAttemptedPer90] ?? 0) - expected) < 0.001);
  assert.equal(oliver.bestPos, "D (L)");
  assert.ok((oliver.askingPrice ?? "").includes("6.25"));
});

test("parseMustermannMoneyballCsv derives OffsidesPer90 from Off and Minutes", () => {
  const csv = readFileSync(FIXTURE, "utf8");
  const parsed = parseMustermannMoneyballCsv(csv);
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(";").map((x) => x.trim());
  const offIdx = headers.indexOf("Off");
  const playerIdx = headers.indexOf("Player");
  const minutesIdx = headers.indexOf("Minutes");
  assert.ok(offIdx >= 0);
  const oliverRaw = lines
    .slice(1)
    .map((line) => line.split(";").map((x) => x.trim()))
    .find((cols) => cols[playerIdx]?.includes("Oliver Sorg"));
  assert.ok(oliverRaw);
  const oliver = parsed.rows.find((r) => r.player.includes("Oliver Sorg"));
  assert.ok(oliver);
  const offTotal = Number(oliverRaw[offIdx] ?? "0");
  const minutes = Number(oliverRaw[minutesIdx] ?? "0");
  const expectedOffPer90 = minutes > 0 ? (offTotal / minutes) * 90 : 0;
  assert.ok(Math.abs((oliver.stats[MoneyballStat.OffsidesPer90] ?? 0) - expectedOffPer90) < 0.001);
});

test("parseMustermannMoneyballCsv parses TacklesAttempted from Tck A", () => {
  const csv = readFileSync(FIXTURE, "utf8");
  const parsed = parseMustermannMoneyballCsv(csv);
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(";").map((x) => x.trim());
  const tckAIdx = headers.indexOf("Tck A");
  const playerIdx = headers.indexOf("Player");
  assert.ok(tckAIdx >= 0);
  const oliverRaw = lines
    .slice(1)
    .map((line) => line.split(";").map((x) => x.trim()))
    .find((cols) => cols[playerIdx]?.includes("Oliver Sorg"));
  assert.ok(oliverRaw);
  const oliver = parsed.rows.find((r) => r.player.includes("Oliver Sorg"));
  assert.ok(oliver);
  const expected = Number(oliverRaw[tckAIdx] ?? "0");
  assert.equal(oliver.stats[MoneyballStat.TacklesAttempted], expected);
});

test("parseMustermannMoneyballCsv requires Tck A column", () => {
  const csv = readFileSync(FIXTURE, "utf8");
  const [header, ...rest] = csv.split(/\r?\n/);
  const headerCols = header.split(";").map((x) => x.trim());
  const tckAIdx = headerCols.indexOf("Tck A");
  assert.ok(tckAIdx >= 0);
  const withoutTckA = [
    headerCols.filter((_, idx) => idx !== tckAIdx).join(";"),
    ...rest
      .filter(Boolean)
      .map((line) => line.split(";").map((x) => x.trim()))
      .map((cols) => cols.filter((_, idx) => idx !== tckAIdx).join(";")),
  ].join("\n");
  const parsed = parseMustermannMoneyballCsv(withoutTckA);
  assert.ok(parsed.errors.some((e) => e.message.includes("Missing required column: Tck A")));
});
