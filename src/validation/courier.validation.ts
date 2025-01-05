import Joi from 'joi';
import validate from './validate';
// import { timezoneValidator } from './session.validate';

const loginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().required(),
});

const registerCourierProfileSchema = Joi.object({
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  licenseNumber: Joi.string().required(),
  licenseExpiry: Joi.string().required(),
  vehicleType: Joi.string().required(),
  vehicleMake: Joi.string().required(),
  vehicleModel: Joi.string().required(),
  vehicleYear: Joi.string().required(),
  vehicleColor: Joi.string().required(),
});

export default {
  loginSchemaValidation: validate(loginSchema),
  registerCourierProfileSchemaValidation: validate(
    registerCourierProfileSchema,
  ),
};
