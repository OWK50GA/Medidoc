/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";

import {
  UpdatePatientProfileSchema,
  OrganizationAccessSchema,
  PractitionerAccessSchema,
  AccessIdParamsSchema,
  NewEpisodeLabelSchema,
  NewSummarySchema,
  NewClinicalEntrySchema
} from "./patient.ts";

// UpdatePatientProfileSchema
test("UpdatePatientProfileSchema accepts an empty object (all fields optional)", () => {
  const result = UpdatePatientProfileSchema.safeParse({});
  assert.equal(result.success, true);
});

test("UpdatePatientProfileSchema accepts valid name, phone, and address", () => {
  const result = UpdatePatientProfileSchema.safeParse({
    name: "John Doe",
    phone: "+2348012345678",
    address: "12 Lagos Street"
  });
  assert.equal(result.success, true);
});

test("UpdatePatientProfileSchema rejects a name shorter than 3 characters", () => {
  const result = UpdatePatientProfileSchema.safeParse({ name: "Jo" });
  assert.equal(result.success, false);
});

// OrganizationAccessSchema
test("OrganizationAccessSchema accepts a valid UUID", () => {
  const result = OrganizationAccessSchema.safeParse({
    organization_id: "550e8400-e29b-41d4-a716-446655440000"
  });
  assert.equal(result.success, true);
});

test("OrganizationAccessSchema rejects a non-UUID string", () => {
  const result = OrganizationAccessSchema.safeParse({
    organization_id: "not-a-uuid"
  });
  assert.equal(result.success, false);
});

// PractitionerAccessSchema
test("PractitionerAccessSchema accepts a valid UUID", () => {
  const result = PractitionerAccessSchema.safeParse({
    practitioner_id: "550e8400-e29b-41d4-a716-446655440000"
  });
  assert.equal(result.success, true);
});

test("PractitionerAccessSchema rejects a missing practitioner_id", () => {
  const result = PractitionerAccessSchema.safeParse({});
  assert.equal(result.success, false);
});

// AccessIdParamsSchema
test("AccessIdParamsSchema accepts a valid UUID", () => {
  const result = AccessIdParamsSchema.safeParse({
    accessId: "550e8400-e29b-41d4-a716-446655440000"
  });
  assert.equal(result.success, true);
});

test("AccessIdParamsSchema rejects a non-UUID accessId", () => {
  const result = AccessIdParamsSchema.safeParse({ accessId: "12345" });
  assert.equal(result.success, false);
});

// NewEpisodeLabelSchema
test("NewEpisodeLabelSchema accepts a non-empty label", () => {
  const result = NewEpisodeLabelSchema.safeParse({
    label: "Respiratory Episode"
  });
  assert.equal(result.success, true);
});

test("NewEpisodeLabelSchema rejects an empty string label", () => {
  const result = NewEpisodeLabelSchema.safeParse({ label: "" });
  assert.equal(result.success, false);
});

test("NewEpisodeLabelSchema rejects a missing label", () => {
  const result = NewEpisodeLabelSchema.safeParse({});
  assert.equal(result.success, false);
});

// NewSummarySchema
test("NewSummarySchema accepts valid category, data, and optional episode_id", () => {
  const result = NewSummarySchema.safeParse({
    category: "medications",
    data: { drug: "paracetamol", dose: "500mg" },
    episode_id: "550e8400-e29b-41d4-a716-446655440000"
  });
  assert.equal(result.success, true);
});

test("NewSummarySchema accepts a valid category without episode_id", () => {
  const result = NewSummarySchema.safeParse({
    category: "allergies",
    data: { allergen: "peanuts" }
  });
  assert.equal(result.success, true);
});

test("NewSummarySchema rejects an invalid category", () => {
  const result = NewSummarySchema.safeParse({
    category: "unknown_category",
    data: {}
  });
  assert.equal(result.success, false);
});

test("NewSummarySchema rejects a non-UUID episode_id", () => {
  const result = NewSummarySchema.safeParse({
    category: "care_plan",
    data: {},
    episode_id: "not-a-uuid"
  });
  assert.equal(result.success, false);
});

// NewClinicalEntrySchema
test("NewClinicalEntrySchema accepts valid input with ISO date string", () => {
  const result = NewClinicalEntrySchema.safeParse({
    event_type: "observation",
    data: { note: "Patient stable" },
    occurred_at: "2024-01-15T10:30:00.000Z"
  });
  assert.equal(result.success, true);
});

test("NewClinicalEntrySchema coerces a date string to a Date object", () => {
  const result = NewClinicalEntrySchema.safeParse({
    event_type: "vital_signs",
    data: { bp: "120/80" },
    occurred_at: "2024-06-01T08:00:00.000Z"
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.ok(result.data.occurred_at instanceof Date);
  }
});

test("NewClinicalEntrySchema rejects an invalid event_type", () => {
  const result = NewClinicalEntrySchema.safeParse({
    event_type: "invalid_type",
    data: {},
    occurred_at: new Date().toISOString()
  });
  assert.equal(result.success, false);
});

test("NewClinicalEntrySchema rejects a missing occurred_at", () => {
  const result = NewClinicalEntrySchema.safeParse({
    event_type: "note",
    data: {}
  });
  assert.equal(result.success, false);
});

test("NewClinicalEntrySchema accepts an optional episode_id as a valid UUID", () => {
  const result = NewClinicalEntrySchema.safeParse({
    event_type: "lab_result",
    data: { result: "normal" },
    occurred_at: new Date().toISOString(),
    episode_id: "550e8400-e29b-41d4-a716-446655440000"
  });
  assert.equal(result.success, true);
});
