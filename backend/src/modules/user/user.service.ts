import { prisma } from "../../lib/prisma";

export function listUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true }, // strict nécessaire ; JAMAIS password ni role
    orderBy: { name: "asc" },
  });
}