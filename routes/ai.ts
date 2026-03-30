import express from "express";
import { generatePostDraft } from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate", generatePostDraft);

export default router;