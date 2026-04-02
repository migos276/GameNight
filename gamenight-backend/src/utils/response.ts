import { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: unknown,
  statusCode = 200,
  message?: string
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
