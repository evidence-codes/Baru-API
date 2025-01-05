import Joi from 'joi';
import validate from './validate';

const createPackageSchema = Joi.object({
  receiverName: Joi.string().required(),
  receiverPhoneNumber: Joi.string().required(),
  category: Joi.string().required(),
  packageName: Joi.string().required(),
  weight: Joi.number().required(),
  quantity: Joi.number().required(),
  value: Joi.number().required(),
  preferredVehicle: Joi.string().required(),
  pickupLocation: Joi.string().required(),
  dropOffLocation: Joi.string().required(),
  // deliveryInstructions: Joi.string().required(),
  deliveryCost: Joi.number().required(),
  distance: Joi.number().required(),
  eta: Joi.number().required(),
});

const calculateDeliveryCostSchema = Joi.object({
  weight: Joi.number().required(),
  distance: Joi.number().required(),
  category: Joi.string().required(),
  preferredVehicle: Joi.string().required(),
});

export default {
  createPackageSchemaValidation: validate(createPackageSchema),
  calculateDeliveryCostSchemaValidation: validate(calculateDeliveryCostSchema),
};
