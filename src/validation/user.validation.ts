import Joi from 'joi';
import validate from './validate';
// import { timezoneValidator } from './session.validate';
import { Language } from '../models/User';

const loginSchema = Joi.object({
  username: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().required(),
}).or('username', 'email');

const registerSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().required().min(8),
  language: Joi.string()
    .valid(...Object.values(Language))
    .required(),
  // timezone: Joi.string()
  //   .custom(timezoneValidator, 'Timezone Validation')
  //   .required()
  //   .messages({
  //     'any.invalid':
  //       'Invalid timezone. Please provide a valid IANA timezone, e.g., Africa/Lagos',
  //   }),
});

const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().optional(),
  username: Joi.string().optional(),
}).or('email', 'username');

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required().min(8),
});

const userPersonalDetails = Joi.object({
  fullName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().optional(),
  dateOfBirth: Joi.date().iso().optional(),
});

const changePassword = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(8),
});

const updateUserProfile = Joi.object({
  fullName: Joi.string().optional(),
  username: Joi.string().optional(),
  bio: Joi.string().optional(),
  profilePictureBase64: Joi.string().optional(),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().required(),
  otp: Joi.string().required(),
});

const requestNewCodeSchema = Joi.object({
  email: Joi.string().required(),
});

const changeEmailSchema = Joi.object({
  oldEmail: Joi.string().required(),
  newEmail: Joi.string().email().required(),
});

const updateAppSettings = Joi.object({
  theme: Joi.string().valid('light', 'dark').required(),
  language: Joi.string().required(),
});

export default {
  loginSchemaValidation: validate(loginSchema),
  registerSchemaValidation: validate(registerSchema),
  requestPasswordResetSchemaValidation: validate(requestPasswordResetSchema),
  resetPasswordSchemaValidation: validate(resetPasswordSchema),
  userPersonalDetailsValidation: validate(userPersonalDetails),
  changePasswordValidation: validate(changePassword),
  updateUserProfileValidation: validate(updateUserProfile),
  verifyEmailSchemaValidation: validate(verifyEmailSchema),
  requestNewCodeSchemaValidation: validate(requestNewCodeSchema),
  changeEmailSchemaValidation: validate(changeEmailSchema),
  updateAppSettingsValidation: validate(updateAppSettings),
};
