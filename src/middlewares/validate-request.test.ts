/// <reference types="node" />

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateRequest } from "./validate-request.ts";
import { ApiError } from "../utils/api-error.ts";
import * as z from "zod";

// --- Source-level structural assertions ---

test("validateRequest passes non-ZodErrors directly to next without wrapping", async () => {
  const source = await readFile(
    new URL("./validate-request.ts", import.meta.url),
    "utf8"
  );
  assert.match(source, /if \(!\(error instanceof ZodError\)\)/);
  assert.match(source, /return next\(error\)/);
});

test("validateRequest wraps ZodErrors in ApiError.badRequest", async () => {
  const source = await readFile(
    new URL("./validate-request.ts", import.meta.url),
    "utf8"
  );
  assert.match(source, /ApiError\.badRequest\(/);
  assert.match(source, /z\.flattenError\(error\)/);
});

// --- Behavioural runtime tests ---

const makeReqRes = (body: unknown, params?: unknown) => {
  const req = { body, params: params ?? {} } as never;
  const res = {} as never;
  return { req, res };
};

test("validateRequest calls next() with no arguments when body is valid", () => {
  const schema = z.object({ name: z.string().min(1) });
  const middleware = validateRequest(schema);
  const { req, res } = makeReqRes({ name: "Alice" });

  let calledWith: unknown = "NOT_CALLED";
  middleware(req, res, (err?: unknown) => {
    calledWith = err;
  });

  assert.equal(calledWith, undefined);
});

test("validateRequest calls next with ApiError.badRequest for invalid body", () => {
  const schema = z.object({ age: z.number() });
  const middleware = validateRequest(schema);
  const { req, res } = makeReqRes({ age: "not-a-number" });

  let calledWith: unknown = null;
  middleware(req, res, (err?: unknown) => {
    calledWith = err;
  });

  assert.ok(calledWith instanceof ApiError);
  assert.equal((calledWith as ApiError).statusCode, 400);
  assert.equal((calledWith as ApiError).message, "Invalid request data");
});

test("validateRequest mutates req.body with the parsed (transformed) value", () => {
  const schema = z.object({ count: z.coerce.number() });
  const middleware = validateRequest(schema);
  const req = { body: { count: "42" }, params: {} } as never;

  middleware(req, {} as never, () => {});

  assert.equal((req as { body: { count: number } }).body.count, 42);
});

test("validateRequest validates req.params when source is 'params'", () => {
  const schema = z.object({ id: z.string().uuid() });
  const middleware = validateRequest(schema, "params");
  const { req, res } = makeReqRes({}, { id: "not-a-uuid" });

  let calledWith: unknown = null;
  middleware(req, res, (err?: unknown) => {
    calledWith = err;
  });

  assert.ok(calledWith instanceof ApiError);
  assert.equal((calledWith as ApiError).statusCode, 400);
});

test("validateRequest passes non-Zod errors through to next unchanged", () => {
  const runtimeError = new TypeError("unexpected");

  const faultySchema = {
    parse() {
      throw runtimeError;
    }
  } as unknown as z.ZodObject<z.ZodRawShape>;

  const middleware = validateRequest(faultySchema);
  const { req, res } = makeReqRes({ anything: true });

  let calledWith: unknown = null;
  middleware(req, res, (err?: unknown) => {
    calledWith = err;
  });

  assert.equal(calledWith, runtimeError);
});
