import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import * as gamesService from "./games.service";
import { sendSuccess } from "../../utils/response";

export const vote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const vote = await gamesService.voteForGame(
      req.params.gameId,
      req.user!.userId
    );
    sendSuccess(res, vote, 201, "Vote registered");
  } catch (err) {
    next(err);
  }
};

export const removeVote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await gamesService.removeVote(req.params.gameId, req.user!.userId);
    sendSuccess(res, null, 200, "Vote removed");
  } catch (err) {
    next(err);
  }
};
