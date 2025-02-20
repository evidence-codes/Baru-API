// your-project-name/src/utils/responseHandler.ts

import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export function successResponse<TD>({
  res,
  message,
  data,
  status,
}: {
  res: Response;
  message: string;
  data?: TD;
  status?: number;
}) {
  if (!status) status = StatusCodes.OK;
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export const errorResponse = ({
  res,
  message,
  status,
}: {
  res: Response;
  message: string;
  status?: number;
}) => {
  if (!status) status = StatusCodes.BAD_REQUEST;
  return res.status(status).json({
    success: false,
    message,
  });
};
