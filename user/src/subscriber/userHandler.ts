import UserController from "../controller/user.controller";

const { updateUserPersonalDetails, updateUserProfile } = UserController;

export const handleUserRequest = async (request: {
  type: string;
  data: any;
}) => {
  const userActions: Record<string, (data: any) => Promise<any>> = {
    "update-user-profile": updateUserProfile,
    "update-user-settings": updateUserPersonalDetails,
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
  } catch (err: any) {
    console.error("❌ Error executing user action:", err);
    return { error: err.message };
  }
};
