import { Router } from "express";
import { redirectBotToTwitchController } from "../controllers/login/bot/redirectBotToTwitch.controller.js";
import { botCallbackController } from "../controllers/login/bot/botCallback.controller.js";

const router = Router();

router.get("/twitch", redirectBotToTwitchController)
router.get("/twitch/callback", botCallbackController)

export default router;