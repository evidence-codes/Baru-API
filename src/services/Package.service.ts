import { PackageRepository } from '../ormconfig';
import { Package } from '../models/Packages';
import { generateRandomString } from '../utils/helpers';

class PackageService {
  async savePackage(data: Partial<Package>): Promise<Package> {
    return await PackageRepository.save(data);
  }

  async createUniqueTrackingID(): Promise<string> {
    let trackingID: string;
    const packageRepository = PackageRepository;
    let existingPackage: Package | null;

    // Loop until we find a unique tracking ID
    do {
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      const currentMonth = new Date().getMonth() + 1;
      const randomLetters = generateRandomString(2);

      // Construct the tracking ID
      trackingID = `BARU-${randomNumber}-${currentMonth < 10 ? '0' + currentMonth : currentMonth}${randomLetters}`;

      // Check if the generated tracking ID already exists in the database
      existingPackage = await packageRepository.findOne({
        where: { trackingID },
      });
    } while (existingPackage);

    return trackingID;
  }

  async calculateDeliveryCost(
    weight: number, // in kg
    distance: number, // in km
    category: string, // e.g. "fragile", "oversized"
    vehicleType: string, // e.g. "bike", "car", "truck"
  ): Promise<number> {
    // Define Naira pricing for weight and distance
    const pricePerKg = 500; // ₦500 per kg
    const pricePerKm = 50; // ₦50 per km

    // Define category charges in Naira
    const categoryCharges: { [key: string]: number } = {
      fragile: 1000, // ₦1000 for fragile items
      oversized: 1500, // ₦1500 for oversized items
      normal: 0, // No charge for normal items
    };

    // Define vehicle type costs in Naira
    const vehicleCosts: { [key: string]: number } = {
      bike: 2000, // ₦2000 for bike
      car: 4000, // ₦4000 for car
      truck: 10000, // ₦10000 for truck
    };

    // Calculate cost based on weight
    const weightCost = weight * pricePerKg;

    // Calculate cost based on distance
    const distanceCost = distance * pricePerKm;

    // Add category charge
    const categoryCharge = categoryCharges[category.toLowerCase()] || 0;

    // Add vehicle type cost
    const vehicleCost = vehicleCosts[vehicleType.toLowerCase()] || 0;

    // Total delivery cost in Naira (₦)
    const totalCost = weightCost + distanceCost + categoryCharge + vehicleCost;

    return totalCost;
  }
}

export default new PackageService();
