export class TimeSlot {
  readonly start: Date;
  readonly end: Date;

  constructor(start: Date, end: Date) {
    if (end <= start) {
      throw new Error("Créneau invalide : la fin doit être postérieure au début.");
    }
    this.start = start;
    this.end = end;
  }

  // Deux créneaux se chevauchent si l'un commence avant que l'autre finisse,
  // et réciproquement. Des créneaux "collés" (fin = début) ne chevauchent PAS.
  overlaps(other: TimeSlot): boolean {
    return this.start < other.end && other.start < this.end;
  }
}