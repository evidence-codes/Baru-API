import { Request as ExpressRequest } from "express";
import { User } from "../models/User";

export interface Request extends ExpressRequest {
  user?: User;
  userId?: string;
}
