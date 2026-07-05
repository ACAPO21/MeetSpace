import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "./auth.service";

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides" });

  try {
    const user = await authService.register(
      parsed.data.email, parsed.data.password, parsed.data.name
    );
    return res.status(201).json(user);
  } catch (e) {
    if ((e as Error).message === "EMAIL_TAKEN")
      return res.status(409).json({ error: "Email déjà utilisé" });
    console.error("Erreur inscription :", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides" });

  try {
    const result = await authService.login(parsed.data.email, parsed.data.password);
    return res.json(result);
  } catch {
    return res.status(401).json({ error: "Identifiants invalides" }); // message générique
  }
}

export async function me(req: Request, res: Response) {
  const user = await authService.getProfile(req.user!.sub);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
  return res.json(user);
}