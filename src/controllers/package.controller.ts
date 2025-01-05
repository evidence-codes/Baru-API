import { Response } from 'express';
import { Request } from '../types/express';
import { PackageRepository } from '../ormconfig';
import { Package, PackageStatus } from '../models/Packages';
import { errorResponse, successResponse } from '../utils/response.handler';
import { catchAsync } from '../utils/helpers';
import PackageService from '../services/Package.service';
import { BadRequestError, UnauthorizedError } from '../utils/error';

const PackageModel = PackageRepository;

class PackageController {
  constructor(private readonly packageService = PackageService) {}

  createPackage = catchAsync(async (req: Request, res: Response) => {
    const data: Partial<Package> = req.body;
    const sender = req.user;

    // Check if the sender is defined, if not, throw an error
    if (!sender) {
      throw new UnauthorizedError('Sender (user) not authenticated');
    }
    const newPackage = await this.packageService.savePackage({
      ...data,
      sender: sender,
      trackingID: await this.packageService.createUniqueTrackingID(),
    });
    return successResponse({
      res,
      message: 'Package created successfully',
      data: newPackage,
    });
  });

  calculateDeliveryCost = catchAsync(async (req: Request, res: Response) => {
    const { weight, distance, category, preferredVehicle } = req.body;

    const cost = await this.packageService.calculateDeliveryCost(
      weight, // in kg
      distance, // in km
      category, // e.g. "fragile", "oversized"
      preferredVehicle, // e.g. "bike", "car", "truck"
    );
    console.log(req.body);
    console.log(cost);
    return successResponse({
      res,
      message: 'Delivery cost calculated',
      data: cost,
    });
  });

  getPackage = catchAsync(async (req: Request, res: Response) => {
    const { trackingID } = req.params;
    if (!trackingID) {
      throw new BadRequestError('Tracking ID is required');
    }
    const pkg = await PackageModel.findOne({ where: { trackingID } });
    if (!pkg) throw new BadRequestError('Package not found');
    return successResponse({ res, message: 'Package found', data: pkg });
  });

  getAllPackages = catchAsync(async (req: Request, res: Response) => {
    // Assuming userId is available from the request (e.g., from the JWT payload or query params)
    const userId = req?.userId as string; // if the user ID is in the token payload

    // Retrieve packages only for the current user
    const packages = await PackageModel.find({
      where: { sender: { id: userId } },
      relations: ['sender'],
    });

    return successResponse({
      res,
      message: 'Packages found',
      data: packages,
    });
  });

  cancelPackage = catchAsync(async (req: Request, res: Response) => {
    const { trackingID } = req.params;

    // Check if tracking ID is provided
    if (!trackingID) {
      throw new BadRequestError('Tracking ID is required');
    }

    // Find the package by tracking ID
    const pkg = await PackageModel.findOne({ where: { trackingID } });

    // If package not found, return an error
    if (!pkg) {
      throw new BadRequestError('Package not found');
    }

    // If the package is already cancelled, return a message indicating it's already canceled
    if (pkg.status === PackageStatus.CANCELLED) {
      throw new BadRequestError('Package has already been cancelled');
    }

    // Update the package status to 'CANCELLED'
    pkg.status = PackageStatus.CANCELLED;

    // Save the updated package
    await this.packageService.savePackage(pkg);

    // Respond with success message
    return successResponse({
      res,
      message: 'Package delivery has been canceled successfully.',
      data: pkg,
    });
  });

  getPackageStatus = catchAsync(async (req, res) => {
    const { trackingID } = req.params;

    if (!trackingID) {
      throw new BadRequestError('Tracking ID is required');
    }

    const pkg = await PackageModel.findOne({ where: { trackingID } });

    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    return res.json({
      status: pkg.status,
      currentLocation: {
        latitude: pkg.currentLatitude,
        longitude: pkg.currentLongitude,
      },
      lastUpdatedAt: pkg.lastUpdatedAt,
    });
  });

  searchPackages = catchAsync(async (req: Request, res: Response) => {
    const { trackingId, status } = req.query;

    if (!trackingId && !status) {
      throw new BadRequestError(
        'Please provide either a tracking ID or status to search',
      );
    }

    const conditions: any = {};
    if (trackingId) conditions.trackingID = trackingId;
    if (status) conditions.status = status;

    const packages = await PackageModel.find({
      where: conditions,
      order: {
        lastUpdatedAt: 'DESC',
      },
    });

    return successResponse({
      res,
      message: 'Packages fetched successfully',
      data: packages,
    });
  });

  getPackageHistory = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const packageHistory = await PackageModel.find({
      where: { sender: user },
      order: {
        lastUpdatedAt: 'DESC',
      },
    });

    return successResponse({
      res,
      message: 'Package history fetched successfully',
      data: packageHistory,
    });
  });
}

export default new PackageController();
