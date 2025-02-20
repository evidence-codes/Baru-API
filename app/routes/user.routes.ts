// user.routes.ts

import express from 'express';
import UserController from '../controllers/user.controller';
import Validator from '../validation/user.validation';
import { isAuthenticated } from '../middlewares/auth.middleware';

const {
  userPersonalDetailsValidation,
  changePasswordValidation,
  updateUserProfileValidation,
  updateAppSettingsValidation,
} = Validator;

const userRouter = express.Router();

userRouter.get('/delete-account/confirm', UserController.confirmDeleteAccount);

userRouter.use(isAuthenticated);
userRouter.put(
  '/settings/personal-details',

  userPersonalDetailsValidation,
  UserController.updateUserPersonalDetails,
);
userRouter.put(
  '/settings/change-password',

  changePasswordValidation,
  UserController.changeUserPassword,
);
userRouter.delete(
  '/settings/delete-account',

  UserController.deleteUserAccount,
);
userRouter.post(
  '/settings/logout',

  UserController.logOutUserAccount,
);

userRouter.put(
  '/settings/app-settings',

  updateAppSettingsValidation,
  UserController.updateAppSettings,
);

// User Profile
userRouter.put(
  '/profile',

  updateUserProfileValidation,
  UserController.updateUserProfile,
);

userRouter.get('/profile', UserController.getUserProfile);

export default userRouter;
