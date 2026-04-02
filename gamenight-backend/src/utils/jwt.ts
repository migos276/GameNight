import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
if (!ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET is required in .env file');
}
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET is required in .env file');
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
};
