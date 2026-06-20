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
  it("refuse la suppression pour un USER (403)", async () => {
    const res = await request(app).delete(`/rooms/${createdRoomIds[0]}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
  it("supprime en ADMIN (204)", async () => {
    const res = await request(app).delete(`/rooms/${createdRoomIds[0]}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});