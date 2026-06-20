import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";

const testEmail = "test-integration@meetspace.local";
let token: string;

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
});
afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});

describe("API Auth (intégration)", () => {
  it("inscrit un nouvel utilisateur (201)", async () => {
    const res = await request(app).post("/auth/register")
      .send({ email: testEmail, password: "Password123", name: "Test" });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(testEmail);
    expect(res.body.password).toBeUndefined(); // le hash n'est jamais renvoyé
  });

  it("refuse un email déjà utilisé (409)", async () => {
    const res = await request(app).post("/auth/register")
      .send({ email: testEmail, password: "Password123", name: "Test" });
    expect(res.status).toBe(409);
  });

  it("refuse une inscription invalide (400)", async () => {
    const res = await request(app).post("/auth/register")
      .send({ email: "pas-un-email", password: "123", name: "" });
    expect(res.status).toBe(400);
  });

  it("connecte et renvoie un token (200)", async () => {
    const res = await request(app).post("/auth/login")
      .send({ email: testEmail, password: "Password123" });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    token = res.body.token;
  });

  it("refuse un mauvais mot de passe (401)", async () => {
    const res = await request(app).post("/auth/login")
      .send({ email: testEmail, password: "WrongPassword" });
    expect(res.status).toBe(401);
  });

  it("refuse un utilisateur inconnu (401)", async () => {
    const res = await request(app).post("/auth/login")
      .send({ email: "inconnu@meetspace.local", password: "x" });
    expect(res.status).toBe(401);
  });

  it("accède à /me avec un token valide (200)", async () => {
    const res = await request(app).get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
  });

  it("refuse /me sans token (401)", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });
});