import { sendMessage } from "../subscriber/subscriber";

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

interface User {
  id: string;
  fullName: string;
  username: string;
  bio?: string;
  profilePictureUrl?: string;
  theme?: string;
  timezone?: string;
  refreshToken?: string | null;
  hasRequestDelete?: boolean;
}

interface UserProfile {
  fullName: string;
  username: string;
  bio: string;
  profilePictureUrl?: string;
}

interface AppSettings {
  theme: string;
  timezone: string;
}

const queue = "user_queue";

class UserService {
  async getUserById(id: string): Promise<User> {
    try {
      const response = await sendMessage(queue, {
        type: "get-user-by-id",
        data: { id },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.user; // Assuming the response contains a `user` object
    } catch (error: any) {
      throw new Error(`Failed to fetch user data: ${error.message}`);
    }
  }

  async editUserProfile(id: string, data: UserProfile): Promise<User> {
    try {
      const response = await sendMessage(queue, {
        type: "edit-user-profile",
        data: { id, ...data },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.user;
    } catch (error: any) {
      throw new Error(`Failed to edit user profile: ${error.message}`);
    }
  }

  async updateUserSettings(
    id: string,
    data: Partial<Pick<User, "fullName">>
  ): Promise<User> {
    try {
      const response = await sendMessage(queue, {
        type: "update-user-settings",
        data: { id, ...data },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.user;
    } catch (error: any) {
      throw new Error(`Failed to update user settings: ${error.message}`);
    }
  }

  async updateAppSettings(id: string, data: AppSettings): Promise<User> {
    try {
      const response = await sendMessage(queue, {
        type: "update-app-settings",
        data: { id, ...data },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.user;
    } catch (error: any) {
      throw new Error(`Failed to update app settings: ${error.message}`);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await sendMessage(queue, {
        type: "delete-user",
        data: { id },
      });

      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error: any) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async logOut(id: string): Promise<void> {
    try {
      const response = await sendMessage(queue, {
        type: "logout-user",
        data: { id },
      });

      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error: any) {
      throw new Error(`Failed to log out: ${error.message}`);
    }
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    try {
      const response = await sendMessage(queue, {
        type: "update-user",
        data: { id, ...updateData },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.user;
    } catch (error: any) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
}

export default new UserService();
