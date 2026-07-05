import { prisma } from "../../lib/prisma";

interface RoomFilters {
  capacityMin?: number;
  equipment?: string;
}

export function listRooms(filters: RoomFilters = {}) {
  return prisma.room.findMany({
    where: {
      capacity: filters.capacityMin ? { gte: filters.capacityMin } : undefined,
      equipments: filters.equipment ? { has: filters.equipment } : undefined,
    },
    include: { building: true },
    orderBy: { name: "asc" },
  });
}

export function createRoom(data: {
  name: string;
  capacity: number;
  equipments: string[];
  buildingId: string;
}) {
  return prisma.room.create({ data });
}

export function updateRoom(
  id: string,
  data: { name?: string; capacity?: number; equipments?: string[]; buildingId?: string }
) {
  return prisma.room.updateMany({ where: { id }, data });
}

// Suppression bloquée si la salle porte des réservations (intégrité référentielle).
export async function removeRoom(id: string) {
  const bookings = await prisma.booking.count({ where: { roomId: id } });
  if (bookings > 0) return { blocked: true, count: 0 };
  const result = await prisma.room.deleteMany({ where: { id } });
  return { blocked: false, count: result.count };
}