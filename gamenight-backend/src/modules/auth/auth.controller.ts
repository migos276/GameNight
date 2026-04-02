import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { AuthRequest } from "../../middlewares/auth";
import {
  sendSuccess,
  sendError,
  COOKIE_OPTIONS,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
} from "../../utils/response";

// Options pour supprimer les cookies
const CLEAR_OPTIONS = COOKIE_OPTIONS;

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sécurité : on extrait uniquement ce dont on a besoin
    const { email, password, name } = req.body;

    // Création de l'utilisateur
    const createdUser = await authService.registerUser({ email, password, name });
    
    // Connexion automatique après inscription
    const { accessToken, refreshToken, user } = await authService.loginUser({
      email,
      password,
    });

    res.cookie(ACCESS_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    sendSuccess(res, { user, accessToken }, 201, "User registered successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * Connexion utilisateur
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.loginUser({ email, password });

    res.cookie(ACCESS_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { user, accessToken }, 200, "Login successful");
  } catch (err) {
    next(err);
  }
};

/**
 * Rafraîchissement de l'Access Token via le Refresh Cookie
 */
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    
    if (!token) {
      return sendError(res, "Refresh token missing", 401);
    }

    const { accessToken } = await authService.refreshAccessToken(token);

    res.cookie(ACCESS_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    sendSuccess(res, { accessToken }, 200, "Token refreshed");
  } catch (err) {
    next(err);
  }
};

/**
 * Déconnexion (Suppression des cookies et révocation du token)
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    
    if (token) {
      await authService.logoutUser(token).catch(() => null); // On ignore si le token est déjà invalide
    }

    res.clearCookie(ACCESS_COOKIE, CLEAR_OPTIONS);
    res.clearCookie(REFRESH_COOKIE, CLEAR_OPTIONS);

    sendSuccess(res, null, 200, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const user = await authService.getMe(req.user.userId);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};