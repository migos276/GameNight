import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import * as eventsController from "./events.controller";
import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  createEventSchema,
  updateEventSchema,
  proposeGameSchema,
} from "./events.schema";
import { AppError } from "../../middlewares/errorHandler";

const router = Router();

const uploadsRoot = path.join(process.cwd(), "uploads");
const eventUploadsDir = path.join(uploadsRoot, "events");
fs.mkdirSync(eventUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: eventUploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const id = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new AppError("Only image files are allowed", 400));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// All event routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: List all events
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: List of events }
 */
router.get("/", eventsController.listEvents);

/**
 * @swagger
 * /api/events:
 *   post:
 *     tags: [Events]
 *     summary: Create a new event
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date, location]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date-time }
 *               location: { type: string }
 *               maxParticipants: { type: integer }
 *     responses:
 *       201: { description: Event created }
 */
router.post(
  "/",
  upload.single("image"),
  validate(createEventSchema),
  eventsController.createEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Get event details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event details }
 *       404: { description: Event not found }
 */
router.get("/:id", eventsController.getEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     tags: [Events]
 *     summary: Update event (host only)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event updated }
 *       403: { description: Forbidden }
 */
router.put("/:id", validate(updateEventSchema), eventsController.updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: Delete event (host only)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event deleted }
 *       403: { description: Forbidden }
 */
router.delete("/:id", eventsController.deleteEvent);

router.post("/:id/join", eventsController.joinEvent);
router.post("/:id/leave", eventsController.leaveEvent);
router.post("/:id/confirm", eventsController.confirmEvent);
router.post("/:id/games", validate(proposeGameSchema), eventsController.proposeGame);

export default router;
