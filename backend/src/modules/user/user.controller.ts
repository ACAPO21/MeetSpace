import { Request, Response } from "express";
import * as userService from "./user.service";

export async function list(_req: Request, res: Response) {
  const users = await userService.listUsers();
  return res.json(users);
}