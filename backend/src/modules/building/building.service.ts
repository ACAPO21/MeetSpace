import { prisma } from "../../lib/prisma";

export function listBuildings() {
  return prisma.building.findMany({ include: { rooms: true }, orderBy: { name: "asc" } });
}

export function createBuilding(name: string, address: string) {
  return prisma.building.create({ data: { name, address } });
}