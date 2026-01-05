import { Router } from "express";
import { redirectBotToTwitchController } from "../controllers/redirectBotToTwitch.controller.js";
import { botCallbackController } from "../controllers/botCallback.controller.js";

const router = Router();

router.get("/bot/twitch", redirectBotToTwitchController)
router.get("/bot/twitch/callback", botCallbackController)

export default router;