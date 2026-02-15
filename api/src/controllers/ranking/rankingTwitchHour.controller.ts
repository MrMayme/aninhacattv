import type { Request, Response } from "express";
import { getTwitchHourRankingService } from "../../services/ranking/rankingTwitchHour.service.js";

export async function rankingTwitchHourController(req: Request, res: Response) {

  const channel = "aninhacattv"
  const period = (req.query.period as string) || "all";

  const ranking = await getTwitchHourRankingService(channel, period);

  res.json(ranking);

}

