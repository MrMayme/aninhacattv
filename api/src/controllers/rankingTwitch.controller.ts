import type { Request, Response } from "express";
import { getTwitchRankingService } from "../services/rankingTwitch.service.js";

export async function rankingTwitchController(req: Request, res: Response) {

  const channel = "aninhacattv"
  const period = (req.query.period as string) || "all";

  const ranking = await getTwitchRankingService(channel, period);

  res.json(ranking);

}

