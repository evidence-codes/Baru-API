import { Request, Response } from "express";
import { Message } from "amqplib";
import bcrypt from "bcryptjs";
import UserRepository from "../ormconfig";
import { Roles, User } from "../models/User";
import { errorResponse, successResponse } from "../utils/response.handler";
import { catchAsync, convertToLowercase } from "../utils/helpers";
import { FindOptionsWhere } from "typeorm";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import AuthService from "../services/Auth.service";
import { BadRequestError } from "../utils/error";
import {
  EmailTemplates,
  sendMail,
  sendWelcomeEmail,
  Subjects,
} from "../utils/emailHelper";
// import { publishToQueue } from "../publisher/publisher";

const UserModel = UserRepository.getRepository("User");

class AuthController {
  constructor(private readonly authService = AuthService) {}

  registerUser = catchAsync(async (msg: any) => {
    const data: Partial<User> = msg;
    const email = convertToLowercase(data.email!);

    const emailTaken = await this.authService.getUserByEmail(email);

    if (emailTaken) {
      return errorResponse({ message: "Email already taken" });
    }

    const newUser = UserModel.create({ email });
    const user = await this.authService.saveUser(newUser);

    this.authService.sendEmailVerification(user).then(() => {});

    return successResponse({
      message: "User registered successfully. Please verify your email.",
      data: user,
    });
  });

  registerUserProfile = catchAsync(async (msg: any) => {
    const { fullName, phoneNumber, email, password } = msg;

    // Find the user by email
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestError("No account found with this email.");
    }

    // Check if the email is verified
    if (!user.isEmailVerified) {
      throw new BadRequestError(
        "Email not verified. Please verify your email first."
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user details
    user.fullName = fullName;
    user.phoneNumber = phoneNumber;
    user.password = hashedPassword;
    user.role = Roles.USER;

    // Save the updated user
    await UserModel.save(user);

    await sendWelcomeEmail({
      to: user.email,
      name: user.fullName?.split(" ")[0] ?? "",
    });

    // Respond with success
    return successResponse({
      message: "User profile updated successfully.",
      data: user,
    });
  });

  loginUser = catchAsync(async (msg: any) => {
    console.log("🛠 Received login request:", msg);

    const data = msg;
    if (!data.email && !data.username) {
      throw new BadRequestError("Email or username is required");
    }

    const query: FindOptionsWhere<User> = {};
    if (data.email) {
      query.email = convertToLowercase(data.email!);
    }

    const user = await UserModel.findOneBy(query);
    console.log("🔍 User found:", user);

    if (!user) {
      throw new BadRequestError("Invalid credentials");
    }

    if (user.isEmailVerified === false) {
      throw new BadRequestError("Please verify your email");
    }

    if (!data.password || typeof data.password !== "string") {
      throw new BadRequestError("Password must be provided as a string");
    }

    if (!user.password || typeof user.password !== "string") {
      throw new BadRequestError("Invalid stored password format");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError("Invalid credentials");
    }

    const accessToken = jwt.sign({ id: user.id }, config.jwt.secret, {
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign({ id: user.id }, config.jwt.secret, {
      expiresIn: "7d",
    });

    user.refreshToken = refreshToken;
    await this.authService.saveUser(user);

    const response = successResponse({
      message: "User logged in successfully",
      data: { user, accessToken },
    });

    console.log("📤 Sending response:", response);
    return response;
  });

  requestUserPasswordReset = catchAsync(async (msg: any) => {
    const data = msg.email || msg.username;

    const identifier = convertToLowercase(data);

    if (!identifier) {
      throw new BadRequestError("Email or username is required");
    }

    const user = await this.authService.getUserByEmailOrUsername(identifier);

    if (!user) {
      throw new BadRequestError("User not found");
    }

    const result = await this.authService.requestPasswordReset(user);
    return successResponse({
      message: "Password reset link sent successfully",
      data: result,
    });
  });

  resetUserPassword = catchAsync(async (msg: any) => {
    const { token, password } = msg;

    const user = await this.authService.getUserFromToken(token);
    if (!user) {
      throw new BadRequestError("Invalid token");
    }
    const result = await this.authService.resetPassword(user, password);

    sendMail({
      to: user.email,
      subject: Subjects["PASSWORD_CHANGE"],
      template: EmailTemplates["PASSWORD_CHANGE"],
      context: {
        name: user.fullName?.split(" ")[0] ?? "",
        email: user.email,
      },
    }).then(() => {});

    return successResponse({
      message: "Password reset successfully",
      data: result,
    });
  });

  verifyEmail = catchAsync(async (msg: any) => {
    const { email, otp } = msg;

    console.log(msg);

    if (!email || !otp) {
      throw new BadRequestError("Email and OTP are required");
    }

    const result = convertToLowercase(email);

    const user = (await UserModel.findOneBy({ email: result })) as User;
    if (!user) {
      throw new BadRequestError("User not found");
    }

    const { id: userId } = user;

    if (user.isEmailVerified) {
      throw new BadRequestError("User already verified");
    }
    const isOtpValid = await this.authService.verifyOtp(userId, otp);

    if (!isOtpValid) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    await this.authService.activateUser(userId);

    return successResponse({
      message: "Account verified successfully",
    });
  });

  requestNewCode = catchAsync(async (msg: any) => {
    const { email } = msg;

    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const result = convertToLowercase(email);

    const user = (await UserModel.findOneBy({ email: result })) as User;
    if (!user) {
      throw new BadRequestError("User not found ");
    }

    if (user.isEmailVerified) {
      throw new BadRequestError("User already verified");
    }

    this.authService.sendEmailVerification(user).then(() => {});

    successResponse({
      message: "New OTP sent to your email.",
    });
  });

  changeEmail = catchAsync(async (msg: any) => {
    const { oldEmail, newEmail } = msg;

    const oldEmailLowercase = convertToLowercase(oldEmail);
    const newEmailLowercase = convertToLowercase(newEmail);
    const email = oldEmailLowercase;

    const user = (await UserModel.findOneBy({ email })) as User;
    if (!user) {
      throw new BadRequestError("User not found ");
    }

    if (user.isEmailVerified) {
      throw new BadRequestError("User already verified");
    }

    // Update the user's email
    user.email = newEmailLowercase;

    await UserModel.save(user);

    this.authService.sendEmailVerification(user).then(() => {});

    successResponse({
      message: "Email updated. New OTP sent to the new email address.",
    });
  });
}

export default new AuthController();
