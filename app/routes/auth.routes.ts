import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import Validator from '../validation/user.validation';

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

authRouter.post(
  '/register',
  registerSchemaValidation,
  AuthController.registerUser,
);
authRouter.post(
  '/register/profile',
  registerProfileSchemaValidation,
  AuthController.registerUserProfile,
);
authRouter.post('/login', loginSchemaValidation, AuthController.loginUser);
authRouter.post(
  '/forgot-password',
  requestPasswordResetSchemaValidation,
  AuthController.requestUserPasswordReset,
);
authRouter.post(
  '/reset-password',
  resetPasswordSchemaValidation,
  AuthController.resetUserPassword,
);

authRouter.post(
  '/verify-email',
  verifyEmailSchemaValidation,
  AuthController.verifyEmail,
);
authRouter.post(
  '/resend-verification-code',
  requestNewCodeSchemaValidation,
  AuthController.requestNewCode,
);
authRouter.post(
  '/change-email',
  changeEmailSchemaValidation,
  AuthController.changeEmail,
);

export default authRouter;
