import { Request, Response } from "express";
import { z } from "zod";
import * as bookingService from "./booking.service";

const createSchema = z.object({
  roomId: z.string().min(1),
  title: z.string().min(1),
  start: z.coerce.date(),
  end: z.coerce.date(),
  participantIds: z.array(z.string()).default([]),
}).refine((d) => d.start < d.end, { message: "La fin doit être après le début" });

export async function create(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides" });

  try {
    const booking = await bookingService.createBooking(
      req.user!.sub, parsed.data.roomId, parsed.data.title,
      parsed.data.start, parsed.data.end, parsed.data.participantIds
    );
    return res.status(201).json(booking);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "ROOM_NOT_FOUND") return res.status(404).json({ error: "Salle introuvable" });
    if (msg === "CONFLICT") return res.status(409).json({ error: "Créneau déjà réservé" });
    console.error("Erreur création de réservation :", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function listMine(req: Request, res: Response) {
  return res.json(await bookingService.listMyBookings(req.user!.sub));
}

export async function cancel(req: Request, res: Response) {
  // Le propriétaire annule sa réservation ; un administrateur peut annuler n'importe laquelle.
  const isAdmin = req.user!.role === "ADMIN";
  const result = isAdmin
    ? await bookingService.cancelBookingAsAdmin(req.params.id)
    : await bookingService.cancelBooking(req.params.id, req.user!.sub);
  if (result.count === 0) return res.status(404).json({ error: "Réservation introuvable" });
  return res.status(204).send();
}

export async function roomAvailability(req: Request, res: Response) {
  return res.json(await bookingService.listRoomAvailability(req.params.roomId));
}

export async function listAll(_req: Request, res: Response) {
  return res.json(await bookingService.listAllBookings());
}