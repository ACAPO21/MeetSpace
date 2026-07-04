import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";

const adminEmail = "room-admin@meetspace.local";
const userEmail = "room-user@meetspace.local";
let adminToken: string;
let userToken: string;
let buildingId: string;
const createdRoomIds: string[] = [];

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
  await request(app).post("/auth/register").send({ email: adminEmail, password: "Password123", name: "Admin" });
  await prisma.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });
  adminToken = (await request(app).post("/auth/login").send({ email: adminEmail, password: "Password123" })).body.token;
  await request(app).post("/auth/register").send({ email: userEmail, password: "Password123", name: "User" });
  userToken = (await request(app).post("/auth/login").send({ email: userEmail, password: "Password123" })).body.token;
  const building = await prisma.building.create({ data: { name: "Room Test Building", address: "Test" } });
  buildingId = building.id;
});
afterAll(async () => {
  await prisma.booking.deleteMany({ where: { room: { buildingId } } });
  await prisma.room.deleteMany({ where: { buildingId } });
  await prisma.building.deleteMany({ where: { id: buildingId } });
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
  await prisma.$disconnect();
});

describe("API Rooms (intégration)", () => {
  it("crée en ADMIN (201)", async () => {
    const res = await request(app).post("/rooms").set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Salle Test", capacity: 12, equipments: ["projecteur"], buildingId });
    expect(res.status).toBe(201);
    createdRoomIds.push(res.body.id);
  });
  it("refuse la création pour un USER (403)", async () => {
    const res = await request(app).post("/rooms").set("Authorization", `Bearer ${userToken}`)
      .send({ name: "X", capacity: 2, equipments: [], buildingId });
    expect(res.status).toBe(403);
  });
  it("liste (200)", async () => {
    const res = await request(app).get("/rooms").set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it("filtre par capacité (US2)", async () => {
    const res = await request(app).get("/rooms?capacityMin=10").set("Authorization", `Bearer ${userToken}`);
    expect(res.body.every((r: { capacity: number }) => r.capacity >= 10)).toBe(true);
  });
  it("filtre par équipement (US2)", async () => {
    const res = await request(app).get("/rooms?equipment=projecteur").set("Authorization", `Bearer ${userToken}`);
    expect(res.body.every((r: { equipments: string[] }) => r.equipments.includes("projecteur"))).toBe(true);
  });
  it("modifie une salle en ADMIN (204)", async () => {
    const res = await request(app).put(`/rooms/${createdRoomIds[0]}`).set("Authorization", `Bearer ${adminToken}`)
      .send({ capacity: 20 });
    expect(res.status).toBe(204);
    const updated = await prisma.room.findUnique({ where: { id: createdRoomIds[0] } });
    expect(updated?.capacity).toBe(20);
  });
  it("refuse la modification pour un USER (403)", async () => {
    const res = await request(app).put(`/rooms/${createdRoomIds[0]}`).set("Authorization", `Bearer ${userToken}`)
      .send({ capacity: 5 });
    expect(res.status).toBe(403);
  });
  it("refuse la suppression d'une salle ayant des réservations (409)", async () => {
    const room = await prisma.room.create({
      data: { name: "Salle occupée", capacity: 4, equipments: [], buildingId },
    });
    createdRoomIds.push(room.id);
    const owner = await prisma.user.findUnique({ where: { email: adminEmail } });
    await prisma.booking.create({
      data: {
        title: "Occup", start: new Date("2026-09-01T10:00:00Z"), end: new Date("2026-09-01T11:00:00Z"),
        roomId: room.id, userId: owner!.id,
      },
    });
    const res = await request(app).delete(`/rooms/${room.id}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });
  it("refuse la suppression pour un USER (403)", async () => {
    const res = await request(app).delete(`/rooms/${createdRoomIds[0]}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
  it("supprime en ADMIN (204)", async () => {
    const res = await request(app).delete(`/rooms/${createdRoomIds[0]}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});