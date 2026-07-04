import { prisma } from "../../lib/prisma";

export function listBuildings() {
  return prisma.building.findMany({ include: { rooms: true }, orderBy: { name: "asc" } });
}

export function createBuilding(name: string, address: string) {
  return prisma.building.create({ data: { name, address } });
}

export function updateBuilding(id: string, data: { name?: string; address?: string }) {
  return prisma.building.updateMany({ where: { id }, data });
}

// Suppression autorisée uniquement si le bâtiment ne contient aucune salle,
// afin de préserver l'intégrité référentielle (une salle ne peut être orpheline).
export async function removeBuilding(id: string) {
  const rooms = await prisma.room.count({ where: { buildingId: id } });
  if (rooms > 0) return { blocked: true, count: 0 };
  const result = await prisma.building.deleteMany({ where: { id } });
  return { blocked: false, count: result.count };
}