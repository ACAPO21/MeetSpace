import { Request, Response } from "express";
import { z } from "zod";
import * as buildingService from "./building.service";

const createSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
});

export async function list(_req: Request, res: Response) {
  const buildings = await buildingService.listBuildings();
  return res.json(buildings);
}

export async function create(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides" });
  const building = await buildingService.createBuilding(parsed.data.name, parsed.data.address);
  return res.status(201).json(building);
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
});

export async function update(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides" });
  const result = await buildingService.updateBuilding(req.params.id, parsed.data);
  if (result.count === 0) return res.status(404).json({ error: "Bâtiment introuvable" });
  return res.status(204).send();
}