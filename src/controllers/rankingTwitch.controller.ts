import type { Request, Response } from "express";
import { getTwitchRankingService } from "../services/rankingTwitch.service.js";

export async function rankingTwitchController(_req: Request, res: Response) {

  const channel = "aninhacattv"

  const ranking = await getTwitchRankingService(channel);

  res.json(ranking);

}

