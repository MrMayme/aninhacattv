import { Router } from "express";
import { rankingTwitchController } from "../controllers/rankingTwitch.controller.js";
import { loginTwitchController } from "../controllers/loginTwitch.controller.js";
import { redirectToTwitchController } from "../controllers/redirectToTwitch.controller.js";

const router = Router();

router.get("/twitch", redirectToTwitchController)
router.get("/twitch/callback", loginTwitchController)

router.get("/live", rankingTwitchController)

export default router;