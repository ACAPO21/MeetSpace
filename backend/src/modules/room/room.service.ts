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

export function removeRoom(id: string) {
  return prisma.room.deleteMany({ where: { id } });
}