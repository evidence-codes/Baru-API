import { Router } from 'express';
import PackageController from '../controllers/package.controller';
import Validator from '../validation/package.validation';
import { isAuthenticated } from '../middlewares/auth.middleware';

const { createPackageSchemaValidation, calculateDeliveryCostSchemaValidation } =
  Validator;
const packageRouter = Router();

packageRouter.use(isAuthenticated);
packageRouter.post(
  '/create',
  createPackageSchemaValidation,
  PackageController.createPackage,
);
packageRouter.post(
  '/calculate-price',
  calculateDeliveryCostSchemaValidation,
  PackageController.calculateDeliveryCost,
);
packageRouter.get('/:trackingID', PackageController.getPackage);
packageRouter.get('/', PackageController.getAllPackages);
packageRouter.get('/status', PackageController.getPackageStatus);
packageRouter.patch('/cancel', PackageController.cancelPackage);
packageRouter.get('/search', PackageController.searchPackages);
packageRouter.get('/history', PackageController.getPackageHistory);

export default packageRouter;
