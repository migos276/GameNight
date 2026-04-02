import { Router } from "express";
import * as gamesController from "./games.controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/games/{gameId}/vote:
 *   post:
 *     tags: [Games]
 *     summary: Vote for a game proposal
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Vote registered }
 *       409: { description: Already voted }
 */
router.post("/:gameId/vote", gamesController.vote);

/**
 * @swagger
 * /api/games/{gameId}/vote:
 *   delete:
 *     tags: [Games]
 *     summary: Remove vote from a game proposal
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Vote removed }
 *       404: { description: Vote not found }
 */
router.delete("/:gameId/vote", gamesController.removeVote);

export default router;
