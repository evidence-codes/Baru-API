import Queue from "bull";
import { config } from "../config/config";

export const otpQueue = new Queue<{
  userId: string;
  otp: string;
}>("otpQueue", {
  redis: config.redis,
});

otpQueue.process(async (job) => {
  console.log(`OTP expired for user: ${job.data.userId}`);
});
