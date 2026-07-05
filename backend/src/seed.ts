import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

// Jeu de donnees de demonstration : 2 comptes (1 administrateur, 1 utilisateur
// standard), 1 batiment et 3 salles aux caracteristiques variees.
// Idempotent (upsert sur des identifiants fixes) : re-executable sans doublon.
const BUILDING_ID = "00000000-0000-0000-0000-000000000001";
const ROOMS = [
  { id: "00000000-0000-0000-0000-000000000011", name: "Salle Ariane", capacity: 4, equipments: ["Visioconference"] },
  { id: "00000000-0000-0000-0000-000000000012", name: "Salle Galilee", capacity: 10, equipments: ["Videoprojecteur", "Tableau blanc"] },
  { id: "00000000-0000-0000-0000-000000000013", name: "Salle Copernic", capacity: 20, equipments: ["Videoprojecteur", "Visioconference"] },
];

async function main() {
  const password = await bcrypt.hash("Password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@meetspace.local" },
    update: {},
    create: { email: "admin@meetspace.local", name: "Alice Admin", password, role: "ADMIN" },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@meetspace.local" },
    update: {},
    create: { email: "user@meetspace.local", name: "Bob Utilisateur", password, role: "USER" },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@meetspace.local" },
    update: {},
    create: { email: "user2@meetspace.local", name: "Carol Utilisatrice", password, role: "USER" },
  });

  await prisma.building.upsert({
    where: { id: BUILDING_ID },
    update: {},
    create: { id: BUILDING_ID, name: "Tour Garonne", address: "1 rue de la Garonne, 31000 Toulouse" },
  });

  for (const room of ROOMS) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: {},
      create: { ...room, buildingId: BUILDING_ID },
    });
  }

  console.log("Seed termine (mot de passe commun : Password123) :");
  console.log(`  - admin : ${admin.email}`);
  console.log(`  - user  : ${user.email}`);
  console.log(`  - user  : ${user2.email}`);
  console.log(`  - 1 batiment, ${ROOMS.length} salles`);
}

main()
  .catch((e) => {
    console.error("Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
