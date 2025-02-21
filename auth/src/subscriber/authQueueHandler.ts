import AuthController from "../controllers/auth.controller";

const {
  loginUser,
  registerUserProfile,
  registerUser,
  requestUserPasswordReset,
  resetUserPassword,
  verifyEmail,
  requestNewCode,
  changeEmail,
} = AuthController;

/**
 * Handles authentication-related requests received from RabbitMQ
 */
export const handleAuthRequest = async (request: {
  type: string;
  data: any;
}) => {
  const authActions: Record<string, (data: any) => Promise<any>> = {
    login: loginUser,
    "register-profile": registerUserProfile,
    register: registerUser,
    "forgot-password": requestUserPasswordReset,
    "reset-password": resetUserPassword,
    "verify-email": verifyEmail,
    "resend-verification-code": requestNewCode,
    "change-email": changeEmail,
  };

  const action = authActions[request.type];

  if (!action) {
    console.error("❌ Invalid auth request type:", request.type);
    return { error: "Invalid request type" };
  }

  try {
    const response = await action(request.data);
    console.log("✅ Auth action response:", response); // Debugging log
    return response; // Ensure response is returned
  } catch (error) {
    console.error("❌ Error executing auth action:", error);
    return { error: "Auth action failed" };
  }
};
