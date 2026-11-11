/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";

import { getRemainingTime } from "./date.ts";

test("getRemainingTime returns all zeros for a past date", () => {
  const past = new Date(Date.now() - 1000);
  const result = getRemainingTime(past);
  assert.deepEqual(result, { days: 0, hours: 0, minutes: 0, seconds: 0 });
});

test("getRemainingTime returns all zeros for the current moment", () => {
  const now = new Date();
  const result = getRemainingTime(now);
  assert.deepEqual(result, { days: 0, hours: 0, minutes: 0, seconds: 0 });
});

test("getRemainingTime returns correct seconds for a near-future date", () => {
  const future = new Date(Date.now() + 30 * 1000);
  const result = getRemainingTime(future);
  assert.ok(
    result.seconds >= 29 && result.seconds <= 30,
    `expected ~30s, got ${result.seconds}`
  );
  assert.equal(result.minutes, 0);
  assert.equal(result.hours, 0);
  assert.equal(result.days, 0);
});

test("getRemainingTime returns correct minutes for a 90-second future date", () => {
  const future = new Date(Date.now() + 90 * 1000);
  const result = getRemainingTime(future);
  assert.equal(result.minutes, 1);
  assert.ok(
    result.seconds >= 29 && result.seconds <= 30,
    `expected ~30s remainder, got ${result.seconds}`
  );
  assert.equal(result.hours, 0);
  assert.equal(result.days, 0);
});

test("getRemainingTime returns correct hours", () => {
  const future = new Date(Date.now() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000);
  const result = getRemainingTime(future);
  assert.equal(result.hours, 2);
  assert.ok(
    result.minutes >= 29 && result.minutes <= 30,
    `expected ~30 minutes, got ${result.minutes}`
  );
  assert.equal(result.days, 0);
});

test("getRemainingTime returns correct days", () => {
  const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const result = getRemainingTime(future);
  assert.equal(result.days, 3);
  assert.ok(result.hours >= 0 && result.hours < 24);
});
