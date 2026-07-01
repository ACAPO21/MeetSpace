import { Request, Response, NextFunction } from "express";

// Middleware de gestion d'erreurs centralisé (dernier maillon de la chaîne).
// Il journalise l'erreur côté serveur et renvoie un message générique au client
// (aucune trace technique n'est exposée). Un middleware d'erreur Express doit
// impérativement déclarer quatre paramètres pour être reconnu comme tel.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error("Erreur serveur :", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Erreur serveur" });
}
