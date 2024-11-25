import { Response } from 'express';
import UserService from '../services/User.service';
import {
  catchAsync,
  convertToLowercase,
  uploadToCloudinary,
} from '../utils/helpers';
import { successResponse } from '../utils/response.handler';
import { BadRequestError, NotFoundError } from '../utils/error';
import { Request } from '../types/express';
import { Language, User } from '../models/User';
import { convertDateFromString } from '../helper/date';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../ormconfig';
import { EmailTemplates, sendMail, Subjects } from '../utils/email/emailHelper';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import AuthService from '../services/Auth.service';
class UserController {
  constructor(private readonly userService = UserService) {}

  updateUserPersonalDetails = catchAsync(
    async (req: Request, res: Response) => {
      const user = req?.user as User;

      if (!user) {
        throw new BadRequestError('User not found');
      }

      const { fullName } = req.body;

      await this.userService.updateUserSettings(user, {
        fullName,
      });
      return successResponse({
        res,
        message: 'User updated successfully',
      });
    },
  );

  updateUserProfile = catchAsync(async (req: Request, res: Response) => {
    const { username, profilePictureBase64 } = req.body;
    const user = req?.user as User;

    // const checkUserExists = await this.userService.checkUserExists(username);
    // if (checkUserExists) {
    //   throw new BadRequestError('Username already exists');
    // }

    if (!user) {
      throw new BadRequestError('User not found');
    }
    const data = req.body;
    // Check if there is a Base64 image and upload it to Cloudinary
    if (profilePictureBase64) {
      const profilePictureUrl = await uploadToCloudinary(profilePictureBase64);
      data.profilePictureUrl = profilePictureUrl;
      delete data.profilePictureBase64;
    }
    await this.userService.editUserProfile(user, req.body);
    return successResponse({
      res,
      message: 'User profile updated successfully',
    });
  });

  updateAppSettings = catchAsync(async (req: Request, res: Response) => {
    const id = req?.userId as string;
    const user = await this.userService.updateAppSettings(id, req.body);
    return successResponse({
      res,
      message: 'User app settings updated successfully',
      data: user,
    });
  });

  getUserProfile = catchAsync(async (req: Request, res: Response) => {
    const id = (req.query.userId || req?.userId) as string;
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return successResponse({
      res,
      message: 'User profile fetched successfully',
      data: user,
    });
  });

  changeUserPassword = catchAsync(async (req: Request, res: Response) => {
    const user = req?.user as User;
    const { oldPassword, newPassword } = req.body;

    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestError('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await UserRepository.save(user);
    return successResponse({
      res,
      message: 'Password changed successfully',
    });
  });

  deleteUserAccount = catchAsync(async (req: Request, res: Response) => {
    const user = req?.user as User;
    if (!user) {
      throw new BadRequestError('User not found');
    }
    await this.userService.deleteUser(user);

    const token = jwt.sign({ id: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
    // Dynamically set protocol and host based on request
    const protocol = req.protocol;
    const host = req.get('host');
    const link = `${protocol}://${host}/api/user/delete-account/confirm?token=${token}`;

    sendMail({
      to: user.email,
      subject: Subjects.ACCOUNT_DELETION,
      template: EmailTemplates.DELETE_ACCOUNT,
      context: {
        name: user.fullName,
        email: user.email,
        link,
      },
    }).then(() => {});

    return successResponse({
      res,
      message: 'User deleted successfully',
    });
  });
  confirmDeleteAccount = catchAsync(async (req: Request, res: Response) => {
    const token = req.query.token as string;

    const user = await AuthService.getUserFromToken(token);
    console.log('Account deleted');
    await UserRepository.delete(user!.id);
    return res.redirect(`${config.clientUrl}/create-account?isDeleted=${true}`);
  });

  logOutUserAccount = catchAsync(async (req: Request, res: Response) => {
    const id = req?.userId as string;

    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.userService.logOut(user);
    return successResponse({
      res,
      message: 'User logged out successfully',
    });
  });
}

export default new UserController();
