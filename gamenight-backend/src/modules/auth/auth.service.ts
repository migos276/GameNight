import bcrypt from "bcrypt";
import prisma from "../../utils/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { AppError } from "../../middlewares/errorHandler";
import { RegisterInput, LoginInput } from "./auth.schema";

const SALT_ROUNDS = 10;

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("Email already in use", 409);

  const hashed = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email: input.email, password: hashed, name: input.name },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return user;
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError("Invalid credentials", 401);

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new AppError("Invalid credentials", 401);

  const payload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name },
  };
};

export const refreshAccessToken = async (token: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError("Refresh token expired or not found", 401);
  }

  const newAccessToken = signAccessToken({
    userId: payload.userId,
    email: payload.email,
  });

  return { accessToken: newAccessToken };
};

export const logoutUser = async (token: string) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};
