import type { Request, Response } from "express";

export function helloAPI(req: Request,  res: Response) {
    res.json({ success: "Aplicação Online" });
}