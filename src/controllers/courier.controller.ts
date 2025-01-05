import { Response } from 'express';
import bcrypt from 'bcryptjs';
import UserRepository, {
  CourierRepository as CourierDetailsModel,
} from '../ormconfig';
import { Roles, User } from '../models/User';
import { errorResponse, successResponse } from '../utils/response.handler';
import { catchAsync, convertToLowercase } from '../utils/helpers';
import { FindOptionsWhere } from 'typeorm';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import AuthService from '../services/Auth.service';
import { BadRequestError } from '../utils/error';
import { Request } from '../types/express';

const UserModel = UserRepository.getRepository('User');

class CourierController {
  constructor(private readonly authService = AuthService) {}

  registerCourierProfile = catchAsync(async (req: Request, res: Response) => {
    const {
      address,
      licenseNumber,
      licenseExpiry,
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
    } = req.body;

    const { email } = req.user as User;
    // Find the user by email
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestError('No account found with this email.');
    }

    // Create and save the CourierDetails for the driver
    const courierDetails = CourierDetailsModel.create({
      address,
      licenseNumber,
      licenseExpiry,
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      user,
    });

    await CourierDetailsModel.save(courierDetails);

    // Save the updated user
    await UserModel.save(user);

    // Respond with success
    successResponse({
      res,
      message: 'Courier profile updated successfully.',
      data: { user, courierDetails },
    });
  });

  loginCourier = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email) {
      throw new BadRequestError('Email is required');
    }

    const query: FindOptionsWhere<User> = { email: convertToLowercase(email) };

    // Find user by email
    const user = await UserModel.findOne({
      where: query,
      relations: ['courierDetails'],
    });

    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }

    if (user.isEmailVerified === false) {
      throw new BadRequestError('Please verify your email');
    }

    if (!password || typeof password !== 'string') {
      throw new BadRequestError('Password must be provided as a string');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestError('Invalid credentials');
    }

    // Check if user has a driver account (courierDetails)
    if (!user.courierDetails) {
      throw new BadRequestError('You do not have a courier account.');
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
      message: 'Courier logged in successfully',
      data: { user, courierDetails: user.courierDetails, accessToken },
    });
  });
}

export default new CourierController();
