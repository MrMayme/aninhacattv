import { Router } from "express";
import { helloAPI } from "../controllers/api.js";

const router = Router();

router.get("/", helloAPI);

export default router;