/*import { Router } from "express";
import { eventSubHandler } from "../eventsub/handlers.js";

const router = Router();

//router.post('/', eventSubHandler)
// Rota de teste ou webhook EventSub
router.post("/", (req, res) => {
  console.log("Webhook EventSub recebido:", req.body);
  res.status(200).send("OK");
});

export default router;*/