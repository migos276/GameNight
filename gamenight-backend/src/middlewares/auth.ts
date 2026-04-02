import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError, ACCESS_COOKIE } from "../utils/response";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
  file?: Express.Multer.File;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies[ACCESS_COOKIE];

  if (!token) {
    sendError(res, "Access token missing", 401);
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    sendError(res, "Invalid or expired access token", 401);
  }
};
