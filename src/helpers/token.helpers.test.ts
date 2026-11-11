/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";

import {
  generateOTP,
  generateHashedToken,
  generateSecureToken,
  verifyHashedToken,
  generateTokenAndHashedToken,
  generateUUID
} from "./token.helpers.ts";

test("generateOTP returns a 6-digit zero-padded string by default", () => {
  const { code } = generateOTP();
  assert.equal(code.length, 6);
  assert.match(code, /^\d{6}$/);
});

test("generateOTP respects custom length", () => {
  const { code } = generateOTP(4);
  assert.equal(code.length, 4);
  assert.match(code, /^\d{4}$/);
});

test("generateOTP hashCode is a 64-char hex string (sha256)", () => {
  const { hashCode } = generateOTP();
  assert.match(hashCode, /^[0-9a-f]{64}$/);
});

test("generateOTP hashCode matches the sha256 of the code", () => {
  const { code, hashCode } = generateOTP();
  const expected = generateHashedToken(code);
  assert.equal(hashCode, expected);
});

test("generateOTP expiresAt is in the future", () => {
  const before = Date.now();
  const { expiresAt } = generateOTP(6, 5);
  const expiry = new Date(expiresAt).getTime();
  assert.ok(expiry > before, "expiresAt should be in the future");
  assert.ok(
    expiry <= before + 5 * 60 * 1000 + 100,
    "expiresAt should not exceed TTL"
  );
});

test("generateHashedToken is deterministic", () => {
  const token = "my-secret-token";
  assert.equal(generateHashedToken(token), generateHashedToken(token));
});

test("generateHashedToken returns a 64-char hex string", () => {
  const hash = generateHashedToken("some-value");
  assert.match(hash, /^[0-9a-f]{64}$/);
});

test("verifyHashedToken returns true for the matching token", () => {
  const token = "verify-me";
  const hash = generateHashedToken(token);
  assert.equal(verifyHashedToken(token, hash), true);
});

test("verifyHashedToken returns false for a different token", () => {
  const hash = generateHashedToken("correct");
  assert.equal(verifyHashedToken("wrong", hash), false);
});

test("generateSecureToken returns a hex string with length 2 * byteCount", () => {
  const token = generateSecureToken(32);
  assert.equal(token.length, 64);
  assert.match(token, /^[0-9a-f]{64}$/);
});

test("generateSecureToken returns unique values on each call", () => {
  const a = generateSecureToken();
  const b = generateSecureToken();
  assert.notEqual(a, b);
});

test("generateTokenAndHashedToken produces a verifiable pair", () => {
  process.env.CRYPTO_SECRET = "c".repeat(32);
  const { token, hashedToken } = generateTokenAndHashedToken("user-id-123");
  const recomputed = generateHashedToken(token);
  assert.equal(hashedToken, recomputed);
});

test("generateTokenAndHashedToken is deterministic for the same id and secret", () => {
  process.env.CRYPTO_SECRET = "c".repeat(32);
  const first = generateTokenAndHashedToken("same-id");
  const second = generateTokenAndHashedToken("same-id");
  assert.equal(first.token, second.token);
  assert.equal(first.hashedToken, second.hashedToken);
});

test("generateUUID returns a valid v4 UUID format", () => {
  const uuid = generateUUID();
  assert.match(
    uuid,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );
});
