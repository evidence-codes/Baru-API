import { User } from '../models/User';
import { UserRepository } from '../ormconfig';
import { BadRequestError } from '../utils/error';
import { uploadToCloudinary } from '../utils/helpers';

interface changePasswordData {
  oldPassword: string;
  newPassword: string;
}

interface UserProfile {
  fullName: string;
  username: string;
  bio: string;
  profilePictureUrl?: string;
}

interface AppSettings {
  language: string;
  theme: string;
  timezone: string;
}

class UserService {
  async editUserProfile(user: User, data: UserProfile): Promise<User> {
    try {
      const updatedUser = UserRepository.merge(user, data);
      return await UserRepository.save(updatedUser);
    } catch (error: any) {
      throw new BadRequestError(`Failed to edit user profile: ${error}`);
    }
  }

  async updateUserSettings(
    user: User,
    data: Partial<
      Pick<User, 'fullName' | 'email' | 'username' | 'dateOfBirth'>
    >,
  ): Promise<User> {
    const updatedUser = UserRepository.merge(user, data);
    return await UserRepository.save(updatedUser);
  }

  async updateAppSettings(id: string, data: AppSettings): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new BadRequestError('User not found');
    }
    const updatedUser = UserRepository.merge(user, data);
    return await UserRepository.save(updatedUser);
  }

  async deleteUser(user: User): Promise<void> {
    user.hasRequestDelete = true;
    await UserRepository.save(user);
  }

  async logOut(user: User): Promise<void> {
    user.refreshToken = null;
    await UserRepository.save(user);
  }

  async checkUserExists(username: string): Promise<boolean> {
    const user = await UserRepository.findOneBy({ username });
    return !!user;
  }
  async getUserById(id: string): Promise<User | null> {
    return await UserRepository.findOneBy({ id });
  }
  async updateUser(user: User, updateData: Partial<User>) {
    return await UserRepository.save({ ...user, ...updateData });
  }
}

export default new UserService();
