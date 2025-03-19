import { catchAsync, uploadToCloudinary } from "../utils/helpers";
import { successResponse } from "../utils/response.handler";
import { BadRequestError } from "../utils/error";
import UserService from "../services/User.service";

class UserController {
  constructor(private readonly userService = UserService) {}

  updateUserPersonalDetails = catchAsync(async (msg: any) => {
    const { fullName } = msg;
    const user = msg.user;

    if (!user) {
      throw new BadRequestError("User not found");
    }

    await this.userService.updateUserSettings(user, { fullName });
    return successResponse({
      message: "User updated successfully",
    });
  });

  updateUserProfile = catchAsync(async (msg: any) => {
    const { username, profilePictureBase64 } = msg;
    const user = msg.user;

    if (!user) {
      throw new BadRequestError("User not found");
    }

    const data: any = { username };
    if (profilePictureBase64) {
      const profilePictureUrl = await uploadToCloudinary(profilePictureBase64);
      data.profilePicture = profilePictureUrl;
    }

    await this.userService.updateUserSettings(user, data);
    return successResponse({
      message: "User profile updated successfully",
    });
  });
}

export default new UserController();
