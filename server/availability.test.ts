import { describe, expect, it } from "vitest";
import { isWithinAvailability } from "./routers";

describe("isWithinAvailability", () => {
  const row = {
    schedule: JSON.stringify({ days: ["mon", "tue", "wed", "thu", "fri"], start: "08:00", end: "18:00", breaks: [{ start: "12:00", end: "13:00" }] }),
    unavailableDays: JSON.stringify(["2026-09-23"]),
  };

  it("allows a weekday appointment inside the configured window", () => {
    expect(isWithinAvailability(new Date(2026, 8, 21, 10, 0), 60, row)).toBe(true);
  });

  it("rejects appointments outside working hours or on a break", () => {
    expect(isWithinAvailability(new Date(2026, 8, 21, 7, 30), 60, row)).toBe(false);
    expect(isWithinAvailability(new Date(2026, 8, 21, 12, 15), 30, row)).toBe(false);
  });

  it("rejects non-working weekdays and unavailable dates", () => {
    expect(isWithinAvailability(new Date(2026, 8, 20, 10, 0), 60, row)).toBe(false);
    expect(isWithinAvailability(new Date(2026, 8, 23, 10, 0), 60, row)).toBe(false);
  });
});
