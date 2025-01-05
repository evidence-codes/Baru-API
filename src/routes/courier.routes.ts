import { Router } from 'express';
import CourierController from '../controllers/courier.controller';
import Validator from '../validation/courier.validation';
import { isAuthenticated } from '../middlewares/auth.middleware';

const { loginSchemaValidation, registerCourierProfileSchemaValidation } =
  Validator;

const courierRouter = Router();

courierRouter.post(
  '/login',
  loginSchemaValidation,
  CourierController.loginCourier,
);

courierRouter.use(isAuthenticated);
courierRouter.post(
  '/register',
  registerCourierProfileSchemaValidation,
  CourierController.registerCourierProfile,
);

export default courierRouter;
