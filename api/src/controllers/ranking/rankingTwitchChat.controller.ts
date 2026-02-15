import type { Request, Response } from "express";
import { getTwitchChatRankingService } from "../../services/ranking/rankingTwitchChat.service.js";

export async function rankingTwitchChatController(req: Request, res: Response) {

  const channel = "aninhacattv"
  const period = (req.query.period as string) || "all";

  const ranking = await getTwitchChatRankingService(channel, period);

  res.json(ranking);

}