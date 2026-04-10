import test from "node:test";
import assert from "node:assert/strict";
import {
  DIVISION_KEY_SEP,
  allDivisionKeysFromRows,
  decodeDivisionKey,
  encodeDivisionKey,
  rowMatchesDivisionKey,
} from "./division-key";
import type { MoneyballRow } from "./types";

test("decodeDivisionKey inverts encodeDivisionKey", () => {
  const key = encodeDivisionKey("Spain", "First Division");
  assert.deepEqual(decodeDivisionKey(key), {
    basedIn: "Spain",
    division: "First Division",
  });
});

test("encodeDivisionKey uses delimiter so same division name differs by country", () => {
  const a = encodeDivisionKey("England", "Premier Division");
  const b = encodeDivisionKey("Scotland", "Premier Division");
  assert.notEqual(a, b);
  assert.ok(a.includes(DIVISION_KEY_SEP));
  assert.ok(b.includes(DIVISION_KEY_SEP));
});

test("rowMatchesDivisionKey matches encoded row key only", () => {
  const row: Pick<MoneyballRow, "basedIn" | "division"> = {
    basedIn: "X",
    division: "D1",
  };
  const key = encodeDivisionKey("X", "D1");
  assert.equal(rowMatchesDivisionKey(row, key), true);
  assert.equal(rowMatchesDivisionKey(row, encodeDivisionKey("Y", "D1")), false);
});

test("allDivisionKeysFromRows returns sorted unique keys", () => {
  const rows: MoneyballRow[] = [
    mkRow({ basedIn: "B", division: "x", uniqueId: "1" }),
    mkRow({ basedIn: "A", division: "y", uniqueId: "2" }),
    mkRow({ basedIn: "A", division: "y", uniqueId: "3" }),
  ];
  const keys = allDivisionKeysFromRows(rows);
  assert.equal(keys.length, 2);
  assert.deepEqual(keys, [encodeDivisionKey("A", "y"), encodeDivisionKey("B", "x")]);
});

function mkRow(p: Partial<MoneyballRow> & Pick<MoneyballRow, "basedIn" | "division" | "uniqueId">): MoneyballRow {
  return {
    inf: "",
    player: "",
    nation: "",
    club: "",
    position: "",
    role: "outfield",
    age: 0,
    potential: "",
    wage: "",
    minutes: 0,
    minsPerGame: 0,
    appearancesRaw: "",
    stats: {},
    ...p,
  };
}
