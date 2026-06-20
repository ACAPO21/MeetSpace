import { prisma } from "../../lib/prisma";
import { TimeSlot } from "../../domain/booking/timeSlot";
import { hasConflict } from "../../domain/booking/availability";

export async function createBooking(
  userId: string, roomId: string, title: string, start: Date, end: Date
) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error("ROOM_NOT_FOUND");

  const candidate = new TimeSlot(start, end); // valide fin > début

  const existing = await prisma.booking.findMany({ where: { roomId } });
  const existingSlots = existing.map((b) => new TimeSlot(b.start, b.end));

  if (hasConflict(candidate, existingSlots)) throw new Error("CONFLICT"); // ← règle TDD

  return prisma.booking.create({ data: { title, start, end, roomId, userId } });
}

export function listMyBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },                 // ← IDOR : ses réservations uniquement
    include: { room: true },
    orderBy: { start: "asc" },
  });
}

export function cancelBooking(id: string, userId: string) {
  return prisma.booking.deleteMany({ where: { id, userId } }); // ← IDOR
}