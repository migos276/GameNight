import { Response, Request, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import * as eventsService from "./events.service";
import { sendSuccess } from "../../utils/response";

const getRequestOrigin = (req: Request) => {
  const host = req.get("host");
  if (!host) return "";
  return `${req.protocol}://${host}`;
};

const enrichEventWithImage = (event: any, req: AuthRequest) => {
  if (!event || !event.imageUrl) return event;
  if (/^https?:\/\//.test(event.imageUrl)) {
    return event;
  }

  const origin = getRequestOrigin(req);
  if (!origin) return event;

  return { ...event, imageUrl: `${origin}${event.imageUrl}` };
};

const enrichEventsWithImage = (events: any[], req: AuthRequest) =>
  events.map((event) => enrichEventWithImage(event, req));

export const listEvents = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const events = await eventsService.listEvents();
    sendSuccess(res, enrichEventsWithImage(events, _req));
  } catch (err) {
    next(err);
  }
};

export const getEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await eventsService.getEvent(req.params.id);
    sendSuccess(res, enrichEventWithImage(event, req));
  } catch (err) {
    next(err);
  }
};

export const createEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const imageUrl = req.file ? `/uploads/events/${req.file.filename}` : undefined;
    const payload = { ...req.body, imageUrl };
    const event = await eventsService.createEvent(payload, req.user!.userId);
    sendSuccess(res, enrichEventWithImage(event, req), 201, "Event created");
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await eventsService.updateEvent(
      req.params.id,
      req.body,
      req.user!.userId
    );
    sendSuccess(res, enrichEventWithImage(event, req), 200, "Event updated");
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await eventsService.deleteEvent(req.params.id, req.user!.userId);
    sendSuccess(res, null, 200, "Event deleted");
  } catch (err) {
    next(err);
  }
};

export const joinEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await eventsService.joinEvent(req.params.id, req.user!.userId);
    sendSuccess(res, null, 200, "Joined event");
  } catch (err) {
    next(err);
  }
};

export const leaveEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await eventsService.leaveEvent(req.params.id, req.user!.userId);
    sendSuccess(res, null, 200, "Left event");
  } catch (err) {
    next(err);
  }
};

export const confirmEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await eventsService.confirmEvent(
      req.params.id,
      req.user!.userId
    );
    sendSuccess(res, enrichEventWithImage(event, req), 200, "Event confirmed");
  } catch (err) {
    next(err);
  }
};

export const proposeGame = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const game = await eventsService.proposeGame(
      req.params.id,
      req.body,
      req.user!.userId
    );
    sendSuccess(res, game, 201, "Game proposed");
  } catch (err) {
    next(err);
  }
};
