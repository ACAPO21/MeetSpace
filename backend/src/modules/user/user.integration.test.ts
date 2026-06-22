import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";

const email = "user-list@meetspace.local";
let token: string;

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email } });
  await request(app).post("/auth/register").send({ email, password: "Password123", name: "Lister" });
  token = (await request(app).post("/auth/login").send({ email, password: "Password123" })).body.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
});

describe("API Users (intégration)", () => {
  it("liste les utilisateurs (id + name uniquement)", async () => {
    const res = await request(app).get("/users").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const u = res.body[0];
    expect(u).toHaveProperty("id");
    expect(u).toHaveProperty("name");
    expect(u).toHaveProperty("email");        // nécessaire pour distinguer les homonymes
    expect(u).not.toHaveProperty("password"); // data minimization : jamais le mot de passe
    expect(u).not.toHaveProperty("role");     // ni le rôle
  });

  it("refuse sans token (401)", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(401);
  });
});