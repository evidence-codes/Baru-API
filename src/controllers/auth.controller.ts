import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import UserRepository from '../ormconfig';
import { Language, Roles, User } from '../models/User';
import { errorResponse, successResponse } from '../utils/response.handler';
import { catchAsync, convertToLowercase } from '../utils/helpers';
import { FindOptionsWhere } from 'typeorm';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import AuthService from '../services/Auth.service';
import { BadRequestError } from '../utils/error';
import {
  EmailTemplates,
  sendMail,
  sendWelcomeEmail,
  Subjects,
} from '../utils/email/emailHelper';

const UserModel = UserRepository.getRepository('User');

class AuthController {
  constructor(private readonly authService = AuthService) {}

  registerUser = catchAsync(async (req: Request, res: Response) => {
    const data: Partial<User> = req.body;
    const email = convertToLowercase(data.email!);

    const emailTaken = await this.authService.getUserByEmail(email);

    if (emailTaken) {
      throw new BadRequestError('Email already taken');
    }

    const newUser = UserModel.create({
      email,
    });

    const user = await this.authService.saveUser(newUser);

    this.authService.sendEmailVerification(user).then(() => {});

    successResponse({
      res,
      message: 'User registered successfully. Please verify your email.',
      data: user,
    });
  });

  registerUserProfile = catchAsync(async (req: Request, res: Response) => {
    const { fullName, phoneNumber, email, password } = req.body;

    // Find the user by email
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestError('No account found with this email.');
    }

    // Check if the email is verified
    if (!user.isEmailVerified) {
      throw new BadRequestError(
        'Email not verified. Please verify your email first.',
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
      name: user.fullName?.split(' ')[0] ?? '',
      link: `${config.clientUrl}/${user?.language}/login`,
    });

    // Respond with success
    successResponse({
      res,
      message: 'User profile updated successfully.',
      data: user,
    });
  });

  loginUser = catchAsync(async (req: Request, res: Response) => {
    const data = req.body;

    if (!data.email && !data.username) {
      throw new BadRequestError('Email or username is required');
    }

    // const email =
    // const username =

    const query: FindOptionsWhere<User> = {};

    if (data.email) {
      query.email = convertToLowercase(data.email!);
    }

    // Find user by email or username
    const user = await UserModel.findOneBy(query);

    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }

    if (user.isEmailVerified === false) {
      throw new BadRequestError('Please verify your email');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestError('Invalid credentials');
    }

    const accessToken = jwt.sign({ id: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign({ id: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.refreshTokenExpiresIn,
    });

    user.refreshToken = refreshToken;
    await this.authService.saveUser(user);

    return successResponse({
      res,
      message: 'User logged in successfully',
      data: { user, accessToken },
    });
  });

  requestUserPasswordReset = catchAsync(async (req: Request, res: Response) => {
    const data = req.body.email || req.body.username;

    const identifier = convertToLowercase(data);

    if (!identifier) {
      throw new BadRequestError('Email or username is required');
    }

    const user = await this.authService.getUserByEmailOrUsername(identifier);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const result = await this.authService.requestPasswordReset(user);
    return successResponse({
      res,
      message: 'Password reset link sent successfully',
      data: result,
    });
  });

  resetUserPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const user = await this.authService.getUserFromToken(token);
    if (!user) {
      throw new BadRequestError('Invalid token');
    }
    const result = await this.authService.resetPassword(user, password);

    sendMail({
      to: user.email,
      subject: Subjects['PASSWORD_CHANGE'],
      template: EmailTemplates['PASSWORD_CHANGE'],
      context: {
        name: user.fullName?.split(' ')[0] ?? '',
        email: user.email,
      },
    }).then(() => {});

    return successResponse({
      res,
      message: 'Password reset successfully',
      data: result,
    });
  });

  verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new BadRequestError('Email and OTP are required');
    }

    const result = convertToLowercase(email);

    const user = (await UserModel.findOneBy({ email: result })) as User;
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const { id: userId } = user;

    if (user.isEmailVerified) {
      throw new BadRequestError('User already verified');
    }
    const isOtpValid = await this.authService.verifyOtp(userId, otp);

    if (!isOtpValid) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    await this.authService.activateUser(userId);

    return successResponse({
      res,
      message: 'Account verified successfully',
    });
  });

  requestNewCode = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError('Email is required');
    }

    const result = convertToLowercase(email);

    const user = (await UserModel.findOneBy({ email: result })) as User;
    if (!user) {
      throw new BadRequestError('User not found ');
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('User already verified');
    }

    this.authService.sendEmailVerification(user).then(() => {});

    successResponse({
      res,
      message: 'New OTP sent to your email.',
    });
  });

  changeEmail = catchAsync(async (req: Request, res: Response) => {
    const { oldEmail, newEmail } = req.body;

    const oldEmailLowercase = convertToLowercase(oldEmail);
    const newEmailLowercase = convertToLowercase(newEmail);
    const email = oldEmailLowercase;

    const user = (await UserModel.findOneBy({ email })) as User;
    if (!user) {
      throw new BadRequestError('User not found ');
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('User already verified');
    }

    // Update the user's email
    user.email = newEmailLowercase;

    await UserModel.save(user);

    this.authService.sendEmailVerification(user).then(() => {});

    successResponse({
      res,
      message: 'Email updated. New OTP sent to the new email address.',
    });
  });
}

export default new AuthController();
