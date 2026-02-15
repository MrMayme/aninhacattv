import { Router } from "express";
import { loginTwitchController } from "../controllers/login/user/loginTwitch.controller.js";
import { redirectToTwitchController } from "../controllers/login/user/redirectToTwitch.controller.js";
import { rankingRateLimit } from "../middlewares/auth.middleware.js";

const router = Router();

//router.get("/twitch", redirectToTwitchController)
//router.get("/twitch/callback", loginTwitchController)

export default router;