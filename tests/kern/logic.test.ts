import assert from "node:assert/strict";
import test from "node:test";
import { getAvailableDates, getAvailableSlots, isValidPhone, MemoryBookingAdapter } from "../../src/kern/booking.ts";
import { explainStyleMatch, recommendStyles } from "../../src/kern/styleFinder.ts";

test("style finder returns two deterministic haircut references for short, low-effort, sharp preferences", () => {
  const results = recommendStyles({ length: "short", effort: "minimal", character: "sharp" });
  assert.deepEqual(results.map((style) => style.id), ["textured-crop", "low-fade"]);
});

test("style finder explains the actual matched preferences", () => {
  const result = recommendStyles({ length: "long", effort: "regular", character: "natural" })[0];
  assert.equal(result.id, "long-layers");
  assert.match(explainStyleMatch(result, { length: "long", effort: "regular", character: "natural" }), /выбранная длина/);
  assert.match(explainStyleMatch(result, { length: "long", effort: "regular", character: "natural" }), /время на укладку/);
});

test("slots follow the selected barber schedule and service duration", () => {
  const now = new Date(2026, 9, 13, 9, 0);
  const slots = getAvailableSlots("haircut", "ilya", "2026-10-13", [], now);
  const available = slots.filter((slot) => slot.barberIds.length > 0);
  assert.equal(available[0].time, "10:00");
  assert.equal(available.at(-1)?.time, "19:00");
  assert.ok(slots.every((slot) => slot.barberIds.length === 0 || slot.barberIds.includes("ilya")));
});

test("occupied time blocks every overlapping start and closed days do not invent availability", () => {
  const now = new Date(2026, 9, 13, 9, 0);
  const reservations = [{ date: "2026-10-13", time: "10:00", barberId: "ilya", duration: 75 }];
  const slots = getAvailableSlots("haircut", "ilya", "2026-10-13", reservations, now);
  assert.equal(slots.find((slot) => slot.time === "10:00")?.barberIds.length, 0);
  assert.equal(slots.find((slot) => slot.time === "10:30")?.barberIds.length, 0);
  assert.equal(slots.find((slot) => slot.time === "11:00")?.barberIds.length, 0);
  assert.equal(slots.find((slot) => slot.time === "11:30")?.barberIds.length, 1);
  assert.deepEqual(getAvailableSlots("haircut", "ilya", "2026-10-18", [], now), []);
});

test("today does not show elapsed slots and bookable dates only include real working slots", () => {
  const now = new Date(2026, 9, 13, 11, 15);
  const slots = getAvailableSlots("haircut", "ilya", "2026-10-13", [], now);
  assert.ok(slots.filter((slot) => slot.barberIds.length > 0).every((slot) => slot.time > "11:30"));
  assert.deepEqual(getAvailableDates("haircut", "ilya", [], now, 1), ["2026-10-13"]);
});

test("memory adapter rejects duplicate and overlapping bookings but allows another barber", async () => {
  const adapter = new MemoryBookingAdapter();
  const first = await adapter.reserve({
    date: "2026-10-13",
    time: "10:00",
    barberIds: ["ilya"],
    duration: 75,
  });
  const overlap = await adapter.reserve({
    date: "2026-10-13",
    time: "10:30",
    barberIds: ["ilya"],
    duration: 30,
  });
  const otherBarber = await adapter.reserve({
    date: "2026-10-13",
    time: "10:00",
    barberIds: ["sasha"],
    duration: 45,
  });
  assert.equal(first.ok, true);
  assert.equal(overlap.ok, false);
  assert.equal(otherBarber.ok, true);
});

test("phone validation accepts international and Russian numbers with separators", () => {
  assert.equal(isValidPhone("+7 (900) 123-45-67"), true);
  assert.equal(isValidPhone("8 900 123 45 67"), true);
  assert.equal(isValidPhone("12345"), false);
});
