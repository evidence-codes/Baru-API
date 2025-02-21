import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { sendMessage } from "../services/rabbitmq.service";

const router = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const response = await sendMessage("auth_queue", req.body);
    res.json(response); // Return the actual response from auth service
  } catch (error) {
    res.status(500).json({ error: "Error processing authentication request" });
  }
});

// router.post("/jobs/create", authMiddleware, async (req, res) => {
//     await sendMessage("jobs_queue", req.body);
//     res.json({ message: "Job creation request sent" });
// });

export default router;
