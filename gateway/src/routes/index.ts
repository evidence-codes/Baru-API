import { Router } from "express";
import { sendMessage } from "../services/rabbitmq.service";

const router = Router();

router.post("/auth/login", async (req, res) => {
  try {
    console.log("📤 Sending auth request...");
    const response = await sendMessage("auth_queue", req.body);
    console.log("📩 Received auth response:", response);

    res.json(response); // Return actual auth service response
  } catch (error: any) {
    console.error("❌ Error processing auth request:", error.message);
    res
      .status(500)
      .json({ error: "Authentication request failed", details: error.message });
  }
});

export default router;
