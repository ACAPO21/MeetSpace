import { TimeSlot } from "./timeSlot";

// Fonction pure : un créneau candidat entre-t-il en conflit avec des créneaux existants ?
export function hasConflict(candidate: TimeSlot, existing: TimeSlot[]): boolean {
  return existing.some((slot) => candidate.overlaps(slot));
}