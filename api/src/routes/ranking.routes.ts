import { Router } from "express";
import { rankingTwitchHourController } from "../controllers/ranking/rankingTwitchHour.controller.js";
import { rankingTwitchChatController } from "../controllers/ranking/rankingTwitchChat.controller.js";
import { rankingTwitchHourAndChatController } from "../controllers/ranking/rankingTwitchHourAndChat.controller.js";

const router = Router();

router.get("/hour", rankingTwitchHourController)
router.get("/chat", rankingTwitchChatController)
router.get("/hourandchat", rankingTwitchHourAndChatController)

export default router;