// user.routes.ts

import express from "express";
import UserController from "../controller/user.controller";
import Validator from "../validation/user.validation";

const {
  userPersonalDetailsValidation,
  changePasswordValidation,
  updateUserProfileValidation,
  updateAppSettingsValidation,
} = Validator;

const userRouter = express.Router();

userRouter.put(
  "/settings/personal-details",
  userPersonalDetailsValidation,
  async (req, res) => {
    try {
      const result = await UserController.updateUserPersonalDetails(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// User Profile
userRouter.put(
  "/profile",

  updateUserProfileValidation,
  async (req, res) => {
    try {
      const result = await UserController.updateUserProfile(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// userRouter.get("/profile", UserController.getUserProfile);

export default userRouter;
