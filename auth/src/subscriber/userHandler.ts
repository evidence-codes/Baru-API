import { UserRepository } from "../ormconfig";
import { User } from "../models/User";

/**
 * Handles user-related requests received from RabbitMQ
 */
export const handleUserRequest = async (request: {
  type: string;
  data: any;
}) => {
  const userActions: Record<string, (data: any) => Promise<any>> = {
    "get-user-by-id": async (data: { id: string }) => {
      const user = await UserRepository.findOneBy({ id: data.id });
      if (!user) {
        return { error: "User not found" };
      }
      return user;
    },

    "edit-user-profile": async (data: {
      id: string;
      updates: Partial<User>;
    }) => {
      const user = await UserRepository.findOneBy({ id: data.id });
      if (!user) return { error: "User not found" };

      Object.assign(user, data.updates);
      await UserRepository.save(user);
      return user;
    },

    "update-user-settings": async (data: {
      id: string;
      settings: Partial<User>;
    }) => {
      const user = await UserRepository.findOneBy({ id: data.id });
      if (!user) return { error: "User not found" };

      Object.assign(user, data.settings);
      await UserRepository.save(user);
      return user;
    },

    // "update-app-settings": async (data: { id: string; theme: string; timezone: string }) => {
    //   const user = await UserRepository.findOneBy({ id: data.id });
    //   if (!user) return { error: "User not found" };

    //   user.theme = data.theme;
    //   user.timezone = data.timezone;
    //   await UserRepository.save(user);
    //   return user;
    // },

    "delete-user": async (data: { id: string }) => {
      const user = await UserRepository.findOneBy({ id: data.id });
      if (!user) return { error: "User not found" };

      await UserRepository.remove(user);
      return { success: true, message: "User deleted successfully" };
    },

    "logout-user": async (data: { id: string }) => {
      const user = await UserRepository.findOneBy({ id: data.id });
      if (!user) return { error: "User not found" };

      user.refreshToken = null;
      await UserRepository.save(user);
      return { success: true, message: "User logged out successfully" };
    },

    "update-user": async (data: { id: string; updates: Partial<User> }) => {
      const user = await UserRepository.findOneBy({ id: data.id });
      if (!user) return { error: "User not found" };

      Object.assign(user, data.updates);
      await UserRepository.save(user);
      return user;
    },
  };

  const action = userActions[request.type];

  if (!action) {
    console.error("❌ Invalid user request type:", request.type);
    return { error: "Invalid request type" };
  }

  try {
    const response = await action(request.data);

    if (response === undefined) {
      console.error("❌ User action returned undefined:", request.type);
      return {
        error: "User action failed",
        details: "Action function returned undefined",
      };
    }

    console.log("✅ User action response:", response);
    return response;
  } catch (error: any) {
    console.error("❌ Error executing user action:", error);
    return { error: "User action failed", details: error.message };
  }
};
