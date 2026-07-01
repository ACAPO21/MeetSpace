import { Request, Response } from "express";
import { z } from "zod";
import * as roomService from "./room.service";

const createSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  equipments: z.array(z.string()).default([]),
  buildingId: z.string().min(1),
});

export async function list(req: Request, res: Response) {
  const capacityMin = req.query.capacityMin ? Number(req.query.capacityMin) : undefined;
  const equipment = typeof req.query.equipment === "string" ? req.query.equipment : undefined;
  const rooms = await roomService.listRooms({ capacityMin, equipment });
  return res.json(rooms);
}

export async function create(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides" });
  const room = await roomService.createRoom(parsed.data);
  return res.status(201).json(room);
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  equipments: z.array(z.string()).optional(),
  buildingId: z.string().min(1).optional(),
});

export async function update(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides" });
  const result = await roomService.updateRoom(req.params.id, parsed.data);
  if (result.count === 0) return res.status(404).json({ error: "Salle introuvable" });
  return res.status(204).send();
}

export async function remove(req: Request, res: Response) {
  const result = await roomService.removeRoom(req.params.id);
  if (result.count === 0) return res.status(404).json({ error: "Salle introuvable" });
  return res.status(204).send();
}