import { Router } from "express";
import { sendMessage } from "../services/rabbitmq.service";
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";

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

// router.use("/api", authMiddleware);

router.post("/user-service", async (req: AuthRequest, res) => {
  try {
    console.log("🔐 Verified User:", req.user);

    // Forward request to user-service via RabbitMQ
    const response = await sendMessage("user_queue", {
      ...req.body,
      user: req.user,
    });

    res.json(response);
  } catch (error: any) {
    console.error("❌ Error forwarding user request:", error.message);
    res
      .status(500)
      .json({ error: "User request failed", details: error.message });
  }
});

export default router;
