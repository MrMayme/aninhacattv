import type { Request, Response } from "express";
import { getTwitchHourAndChatRankingService } from "../../services/ranking/rankingTwitchHourAndChat.service.js";

export async function rankingTwitchHourAndChatController(req: Request, res: Response) {

  const channel = "aninhacattv"
  const period = (req.query.period as string) || "all";

  const ranking = await getTwitchHourAndChatRankingService(channel, period);

  res.json(ranking);

}

