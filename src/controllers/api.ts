import type { Request, Response } from "express";

export function helloAPI(_req: Request,  res: Response) {
    res.json({ success: "Aplicação Online" });
}