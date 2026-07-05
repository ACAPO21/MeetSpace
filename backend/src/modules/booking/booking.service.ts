import { prisma } from "../../lib/prisma";
import { TimeSlot } from "../../domain/booking/timeSlot";
import { hasConflict } from "../../domain/booking/availability";

export async function createBooking(
  userId: string, roomId: string, title: string,
  start: Date, end: Date, participantIds: string[] = []
) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error("ROOM_NOT_FOUND");

  const candidate = new TimeSlot(start, end);

  // requête INDEXÉE (index roomId, start, end) : ne récupère QUE les chevauchements potentiels
  const overlapping = await prisma.booking.findMany({
    where: { roomId, start: { lt: end }, end: { gt: start } },
  });
  if (hasConflict(candidate, overlapping.map((b) => new TimeSlot(b.start, b.end)))) {
    throw new Error("CONFLICT");
  }

  // L'organisateur ne peut pas s'inviter lui-même (US8) : on l'exclut des invités
  // côté serveur, en plus du filtrage déjà fait dans l'interface, et on dédoublonne.
  const inviteeIds = [...new Set(participantIds)].filter((id) => id !== userId);

  return prisma.booking.create({
    data: {
      title, start, end, roomId, userId,
      participants: { connect: inviteeIds.map((id) => ({ id })) },
    },
    include: { participants: { select: { id: true, name: true } } },
  });
}

export function listMyBookings(userId: string) {
  return prisma.booking.findMany({
    where: {
      OR: [
        { userId },                                 // propriétaire
        { participants: { some: { id: userId } } }, // OU invité
      ],
    },
    include: { room: true, participants: { select: { id: true, name: true } } },
    orderBy: { start: "asc" },
  });
}

export function cancelBooking(id: string, userId: string) {
  return prisma.booking.deleteMany({ where: { id, userId } }); // propriétaire uniquement
}

// Modération : un administrateur peut supprimer n'importe quelle réservation.
export function cancelBookingAsAdmin(id: string) {
  return prisma.booking.deleteMany({ where: { id } });
}

export function listRoomAvailability(roomId: string) {
  return prisma.booking.findMany({
    where: { roomId },
    select: { start: true, end: true }, // occupation seule (confidentialité)
    orderBy: { start: "asc" },
  });
}

export function listAllBookings() {
  return prisma.booking.findMany({
    include: {
      room: true,
      user: { select: { id: true, name: true, email: true } }, // organisateur
      participants: { select: { id: true, name: true } },
    },
    orderBy: { start: "asc" },
  });
}