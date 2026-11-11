/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";

import { ApiError } from "./api-error.ts";
import { STATUS_CODES } from "../constants/status-codes.ts";

test("ApiError extends Error", () => {
  const err = ApiError.badRequest();
  assert.ok(err instanceof Error);
  assert.ok(err instanceof ApiError);
  assert.equal(err.name, "ApiError");
});

test("ApiError.badRequest produces 400 with default message", () => {
  const err = ApiError.badRequest();
  assert.equal(err.statusCode, STATUS_CODES.BAD_REQUEST);
  assert.equal(err.message, "Bad Request");
  assert.equal(err.isOperational, true);
});

test("ApiError.badRequest forwards custom message and errors payload", () => {
  const errors = { field: ["is required"] };
  const err = ApiError.badRequest("Validation failed", errors);
  assert.equal(err.message, "Validation failed");
  assert.deepEqual(err.errors, errors);
});

test("ApiError.unauthorized produces 401", () => {
  const err = ApiError.unauthorized();
  assert.equal(err.statusCode, STATUS_CODES.UNAUTHORIZED);
  assert.equal(err.message, "Unauthorized");
});

test("ApiError.unauthorized accepts custom message", () => {
  const err = ApiError.unauthorized("Token expired");
  assert.equal(err.message, "Token expired");
});

test("ApiError.forbidden produces 403", () => {
  const err = ApiError.forbidden();
  assert.equal(err.statusCode, STATUS_CODES.FORBIDDEN);
  assert.equal(err.message, "Forbidden");
});

test("ApiError.notFound produces 404", () => {
  const err = ApiError.notFound();
  assert.equal(err.statusCode, STATUS_CODES.NOT_FOUND);
  assert.equal(err.message, "Not Found");
});

test("ApiError.conflict produces 409", () => {
  const err = ApiError.conflict();
  assert.equal(err.statusCode, STATUS_CODES.CONFLICT);
  assert.equal(err.message, "Conflict");
});

test("ApiError.server produces 500", () => {
  const err = ApiError.server();
  assert.equal(err.statusCode, STATUS_CODES.INTERNAL_SERVER_ERROR);
  assert.equal(err.message, "Internal Server Error");
});

test("ApiError.unprocessableEntity produces 422", () => {
  const err = ApiError.unprocessableEntity();
  assert.equal(err.statusCode, STATUS_CODES.UNPROCESSABLE_ENTITY);
  assert.equal(err.message, "Unprocessable Entity");
});

test("ApiError.tooManyRequests produces 429", () => {
  const err = ApiError.tooManyRequests();
  assert.equal(err.statusCode, STATUS_CODES.TOO_MANY_REQUESTS);
  assert.equal(err.message, "Too Many Requests");
});

test("ApiError constructor sets all fields correctly", () => {
  const errors = ["something went wrong"];
  const err = new ApiError(400, "Custom error", errors, false);
  assert.equal(err.statusCode, 400);
  assert.equal(err.message, "Custom error");
  assert.deepEqual(err.errors, errors);
  assert.equal(err.isOperational, false);
});

test("ApiError has a stack trace", () => {
  const err = ApiError.notFound("Missing resource");
  assert.ok(typeof err.stack === "string");
  assert.ok(err.stack.length > 0);
});
