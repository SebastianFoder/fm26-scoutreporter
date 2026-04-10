import test from "node:test";
import assert from "node:assert/strict";
import {
  mustermannPositionGroupFromBestPos,
  mustermannPositionGroupFromRow,
} from "./mustermann-position-group";

test("mustermannPositionGroupFromBestPos maps goalkeeper", () => {
  assert.equal(mustermannPositionGroupFromBestPos("GK"), "Goalkeeper");
});

test("mustermannPositionGroupFromBestPos maps defender variants", () => {
  assert.equal(mustermannPositionGroupFromBestPos("D (L)"), "Defender");
  assert.equal(mustermannPositionGroupFromBestPos("WB (R)"), "Defender");
});

test("mustermannPositionGroupFromBestPos maps midfielder variants", () => {
  assert.equal(mustermannPositionGroupFromBestPos("M (C)"), "Midfielder");
  assert.equal(mustermannPositionGroupFromBestPos("DM"), "Midfielder");
});

test("mustermannPositionGroupFromBestPos maps attacker variants", () => {
  assert.equal(mustermannPositionGroupFromBestPos("ST (C)"), "Attacker");
  assert.equal(mustermannPositionGroupFromBestPos("AM (R)"), "Attacker");
});

test("mustermannPositionGroupFromRow falls back to position when bestPos is empty", () => {
  assert.equal(
    mustermannPositionGroupFromRow({ bestPos: "", position: "ST (C)" }),
    "Attacker",
  );
});
