// utils/jwt.utils.ts

import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: Number(config.jwt.expiresIn), // Token expires in 1 day
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
};
