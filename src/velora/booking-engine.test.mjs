import assert from "node:assert/strict";
import test from "node:test";
import { createDemoBookingRepository, getAvailableSlots, localDateKey, salonHours, validateContact } from "./booking-engine.mjs";

test("date keys use the local calendar date", () => {
  assert.equal(localDateKey(new Date(2026, 9, 13, 23, 30)), "2026-10-13");
});

test("past dates have no demo times and Sundays use the shorter schedule", () => {
  assert.deepEqual(getAvailableSlots({ dateKey: "2026-10-12", durationMinutes: 60, eligibleMasterIds: ["alyona"], todayKey: "2026-10-13" }), []);
  assert.deepEqual(salonHours("2026-10-18"), { opens: 660, closes: 1080 });
  assert.ok(getAvailableSlots({ dateKey: "2026-10-18", durationMinutes: 120, eligibleMasterIds: ["nika"], todayKey: "2026-10-13" }).every((slot) => Number(slot.time.slice(0, 2)) * 60 + 120 <= 1080));
});

test("same-day times start after the current time", () => {
  const slots = getAvailableSlots({ dateKey: "2026-10-13", durationMinutes: 45, eligibleMasterIds: ["alyona"], todayKey: "2026-10-13", currentMinute: 670 });
  assert.ok(slots.every((slot) => slot.time >= "11:30"));
});

test("slots are deterministic, respect service duration, closing time, and the midday pause", () => {
  const options = { dateKey: "2026-10-14", durationMinutes: 180, masterId: "lika", eligibleMasterIds: ["lika"], todayKey: "2026-10-13" };
  const first = getAvailableSlots(options);
  assert.deepEqual(first, getAvailableSlots(options));
  assert.ok(first.length > 0);
  assert.ok(first.every((slot) => {
    const start = Number(slot.time.slice(0, 2)) * 60 + Number(slot.time.slice(3, 5));
    return start + slot.durationMinutes <= 1200 && !(start < 900 && start + slot.durationMinutes > 840);
  }));
});

test("a reservation blocks overlapping times for the same specialist", () => {
  const reservations = [{ dateKey: "2026-10-14", time: "10:30", masterId: "alyona", durationMinutes: 90 }];
  const slots = getAvailableSlots({ dateKey: "2026-10-14", durationMinutes: 60, masterId: "alyona", eligibleMasterIds: ["alyona"], reservations, todayKey: "2026-10-13" });
  assert.ok(!slots.some((slot) => ["10:00", "10:30", "11:00", "11:30"].includes(slot.time)));
});

test("the demo repository rejects overlaps and persists only anonymized slot fields", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const repository = createDemoBookingRepository(storage);
  assert.equal(repository.reserve({ dateKey: "2026-10-14", time: "10:00", masterId: "nika", durationMinutes: 90 }), true);
  assert.equal(repository.reserve({ dateKey: "2026-10-14", time: "11:00", masterId: "nika", durationMinutes: 45 }), false);
  assert.deepEqual(Object.keys(JSON.parse(values.values().next().value)[0]).sort(), ["dateKey", "durationMinutes", "masterId", "time"]);
});

test("name, Russian phone, and consent are all validated", () => {
  assert.equal(validateContact("", "", false).valid, false);
  assert.equal(validateContact("Лена", "+7 900 000-00-00", true).valid, true);
  assert.ok(validateContact("Лена", "12", true).errors.phone);
  assert.ok(validateContact("Лена", "+7 900 000-00-00", false).errors.consent);
});
