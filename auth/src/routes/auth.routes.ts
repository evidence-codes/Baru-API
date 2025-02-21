import { Router } from "express";
import Validator from "../validation/user.validation";
import { sendMessage } from "../utils/rabbitmqUtils";

const {
  registerSchemaValidation,
  registerProfileSchemaValidation,
  loginSchemaValidation,
  requestPasswordResetSchemaValidation,
  resetPasswordSchemaValidation,
  verifyEmailSchemaValidation,
  requestNewCodeSchemaValidation,
  changeEmailSchemaValidation,
} = Validator;
const authRouter = Router();

authRouter.post("/register", registerSchemaValidation, async (req, res) => {
  try {
    const response = await sendMessage("auth_queue", {
      type: "register",
      data: req.body,
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
authRouter.post(
  "/register/profile",
  registerProfileSchemaValidation,
  async (req, res) => {
    try {
      const response = await sendMessage("auth_queue", {
        type: "register-profile",
        data: req.body,
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);
authRouter.post("/login", loginSchemaValidation, async (req, res) => {
  try {
    const response = await sendMessage("auth_queue", {
      type: "login",
      data: req.body,
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
authRouter.post(
  "/forgot-password",
  requestPasswordResetSchemaValidation,
  async (req, res) => {
    try {
      const response = await sendMessage("auth_queue", {
        type: "forgot-password",
        data: req.body,
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

authRouter.post(
  "/reset-password",
  resetPasswordSchemaValidation,
  async (req, res) => {
    try {
      const response = await sendMessage("auth_queue", {
        type: "reset-password",
        data: req.body,
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

authRouter.post(
  "/verify-email",
  verifyEmailSchemaValidation,
  async (req, res) => {
    try {
      const response = await sendMessage("auth_queue", {
        type: "verify-email",
        data: req.body,
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

authRouter.post(
  "/resend-verification-code",
  requestNewCodeSchemaValidation,
  async (req, res) => {
    try {
      const response = await sendMessage("auth_queue", {
        type: "resend-verification-code",
        data: req.body,
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

authRouter.post(
  "/change-email",
  changeEmailSchemaValidation,
  async (req, res) => {
    try {
      const response = await sendMessage("auth_queue", {
        type: "change-email",
        data: req.body,
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default authRouter;
