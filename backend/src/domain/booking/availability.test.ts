import { TimeSlot } from "./timeSlot";
import { hasConflict } from "./availability";

const slot = (start: string, end: string) =>
  new TimeSlot(new Date(start), new Date(end));

describe("Règle de réservation — détection de conflit", () => {
  it("refuse une réservation qui chevauche un créneau existant", () => {
    const existant = [slot("2026-06-20T10:00", "2026-06-20T11:00")];
    const candidat = slot("2026-06-20T10:30", "2026-06-20T11:30");
    expect(hasConflict(candidat, existant)).toBe(true);
  });

  it("accepte une réservation sur un créneau libre (collé, sans chevauchement)", () => {
    const existant = [slot("2026-06-20T10:00", "2026-06-20T11:00")];
    const candidat = slot("2026-06-20T11:00", "2026-06-20T12:00");
    expect(hasConflict(candidat, existant)).toBe(false);
  });

  it("rejette un créneau dont la fin précède le début (créneau invalide)", () => {
    expect(() => slot("2026-06-20T12:00", "2026-06-20T11:00")).toThrow();
  });

  it("détecte un conflit avec un créneau identique", () => {
    const existant = [slot("2026-06-20T10:00", "2026-06-20T11:00")];
    const candidat = slot("2026-06-20T10:00", "2026-06-20T11:00");
    expect(hasConflict(candidat, existant)).toBe(true);
  });

  it("détecte un conflit quand le candidat englobe un créneau existant", () => {
    const existant = [slot("2026-06-20T11:00", "2026-06-20T12:00")];
    const candidat = slot("2026-06-20T10:00", "2026-06-20T13:00");
    expect(hasConflict(candidat, existant)).toBe(true);
  });

  it("détecte un conflit quand le candidat est inclus dans un créneau existant", () => {
    const existant = [slot("2026-06-20T10:00", "2026-06-20T12:00")];
    const candidat = slot("2026-06-20T10:30", "2026-06-20T11:30");
    expect(hasConflict(candidat, existant)).toBe(true);
  });

  it("accepte un créneau libre parmi plusieurs réservations existantes", () => {
    const existant = [
      slot("2026-06-20T09:00", "2026-06-20T10:00"),
      slot("2026-06-20T11:00", "2026-06-20T12:00"),
    ];
    const candidat = slot("2026-06-20T10:00", "2026-06-20T11:00");
    expect(hasConflict(candidat, existant)).toBe(false);
  });

  it("accepte n'importe quel créneau si aucune réservation n'existe", () => {
    const candidat = slot("2026-06-20T10:00", "2026-06-20T11:00");
    expect(hasConflict(candidat, [])).toBe(false);
  });
});