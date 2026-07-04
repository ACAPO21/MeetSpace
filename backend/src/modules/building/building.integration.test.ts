import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";

const adminEmail = "building-admin@meetspace.local";
const userEmail = "building-user@meetspace.local";
let adminToken: string;
let userToken: string;
const createdIds: string[] = [];

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
  await request(app).post("/auth/register").send({ email: adminEmail, password: "Password123", name: "Admin" });
  await prisma.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });
  adminToken = (await request(app).post("/auth/login").send({ email: adminEmail, password: "Password123" })).body.token;
  await request(app).post("/auth/register").send({ email: userEmail, password: "Password123", name: "User" });
  userToken = (await request(app).post("/auth/login").send({ email: userEmail, password: "Password123" })).body.token;
});
afterAll(async () => {
  await prisma.building.deleteMany({ where: { id: { in: createdIds } } });
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
  await prisma.$disconnect();
});

describe("API Buildings (intégration)", () => {
  it("liste pour un connecté (200)", async () => {
    const res = await request(app).get("/buildings").set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });
  it("refuse la liste sans token (401)", async () => {
    const res = await request(app).get("/buildings");
    expect(res.status).toBe(401);
  });
  it("crée en ADMIN (201)", async () => {
    const res = await request(app).post("/buildings").set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Bat Test", address: "1 rue Test" });
    expect(res.status).toBe(201);
    createdIds.push(res.body.id);
  });
  it("refuse la création pour un USER (403)", async () => {
    const res = await request(app).post("/buildings").set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Interdit", address: "x" });
    expect(res.status).toBe(403);
  });
  it("refuse une création invalide (400)", async () => {
    const res = await request(app).post("/buildings").set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "", address: "" });
    expect(res.status).toBe(400);
  });
  it("modifie un bâtiment en ADMIN (204)", async () => {
    const res = await request(app).put(`/buildings/${createdIds[0]}`).set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Bat Modifié" });
    expect(res.status).toBe(204);
    const updated = await prisma.building.findUnique({ where: { id: createdIds[0] } });
    expect(updated?.name).toBe("Bat Modifié");
  });
  it("refuse la modification pour un USER (403)", async () => {
    const res = await request(app).put(`/buildings/${createdIds[0]}`).set("Authorization", `Bearer ${userToken}`)
      .send({ name: "X" });
    expect(res.status).toBe(403);
  });
  it("refuse la suppression d'un bâtiment contenant des salles (409)", async () => {
    const room = await prisma.room.create({
      data: { name: "S", capacity: 2, equipments: [], buildingId: createdIds[0] },
    });
    const res = await request(app).delete(`/buildings/${createdIds[0]}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
    await prisma.room.delete({ where: { id: room.id } });
  });
  it("supprime un bâtiment vide en ADMIN (204)", async () => {
    const res = await request(app).delete(`/buildings/${createdIds[0]}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});