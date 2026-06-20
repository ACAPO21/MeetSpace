import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";

const emailA = "booking-a@meetspace.local";
const emailB = "booking-b@meetspace.local";
let tokenA: string;
let tokenB: string;
let roomId: string;
let buildingId: string;

beforeAll(async () => {
  await prisma.booking.deleteMany({ where: { user: { email: { in: [emailA, emailB] } } } });
  await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });

  // setup : un bâtiment + une salle (créés en base directement)
  const building = await prisma.building.create({ data: { name: "Test Building", address: "Test" } });
  buildingId = building.id;
  const room = await prisma.room.create({
    data: { name: "Test Room", capacity: 10, equipments: [], buildingId },
  });
  roomId = room.id;

  // 2 utilisateurs + leurs tokens (via l'API réelle)
  await request(app).post("/auth/register").send({ email: emailA, password: "Password123", name: "A" });
  await request(app).post("/auth/register").send({ email: emailB, password: "Password123", name: "B" });
  tokenA = (await request(app).post("/auth/login").send({ email: emailA, password: "Password123" })).body.token;
  tokenB = (await request(app).post("/auth/login").send({ email: emailB, password: "Password123" })).body.token;
});

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { roomId } });
  await prisma.room.deleteMany({ where: { id: roomId } });
  await prisma.building.deleteMany({ where: { id: buildingId } });
  await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
  await prisma.$disconnect();
});

describe("API Bookings (intégration)", () => {
  it("crée une réservation (201)", async () => {
    const res = await request(app).post("/bookings").set("Authorization", `Bearer ${tokenA}`)
      .send({ roomId, title: "Reunion A", start: "2026-08-01T10:00:00Z", end: "2026-08-01T11:00:00Z" });
    expect(res.status).toBe(201);
  });

  it("refuse une réservation qui chevauche (409)", async () => {
    const res = await request(app).post("/bookings").set("Authorization", `Bearer ${tokenA}`)
      .send({ roomId, title: "Reunion B", start: "2026-08-01T10:30:00Z", end: "2026-08-01T11:30:00Z" });
    expect(res.status).toBe(409);
  });

  it("accepte un créneau libre collé (201)", async () => {
    const res = await request(app).post("/bookings").set("Authorization", `Bearer ${tokenA}`)
      .send({ roomId, title: "Reunion C", start: "2026-08-01T11:00:00Z", end: "2026-08-01T12:00:00Z" });
    expect(res.status).toBe(201);
  });

  it("refuse un créneau invalide fin<début (400)", async () => {
    const res = await request(app).post("/bookings").set("Authorization", `Bearer ${tokenA}`)
      .send({ roomId, title: "X", start: "2026-08-01T12:00:00Z", end: "2026-08-01T11:00:00Z" });
    expect(res.status).toBe(400);
  });

  it("refuse sans token (401)", async () => {
    const res = await request(app).post("/bookings")
      .send({ roomId, title: "X", start: "2026-08-01T14:00:00Z", end: "2026-08-01T15:00:00Z" });
    expect(res.status).toBe(401);
  });

  it("ne liste QUE mes réservations (IDOR)", async () => {
    const resA = await request(app).get("/bookings/mine").set("Authorization", `Bearer ${tokenA}`);
    expect(resA.status).toBe(200);
    expect(resA.body.length).toBeGreaterThanOrEqual(2);

    const resB = await request(app).get("/bookings/mine").set("Authorization", `Bearer ${tokenB}`);
    expect(resB.body.length).toBe(0); // B ne voit AUCUNE résa de A
  });

  it("empêche d'annuler la réservation d'autrui (IDOR → 404)", async () => {
    const mine = await request(app).get("/bookings/mine").set("Authorization", `Bearer ${tokenA}`);
    const res = await request(app).delete(`/bookings/${mine.body[0].id}`).set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(404); // 404 = ne révèle pas l'existence
  });

  it("permet d'annuler SA propre réservation (204)", async () => {
    const mine = await request(app).get("/bookings/mine").set("Authorization", `Bearer ${tokenA}`);
    const res = await request(app).delete(`/bookings/${mine.body[0].id}`).set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(204);
  });
});