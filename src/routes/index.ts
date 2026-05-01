import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  upload,
} from "../controllers/event.controller";
import {
  createRegistration,
  getRegistrationsByEvent,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
  getAllRegistrations,
} from "../controllers/registration.controller";
import { createUser } from "../controllers/user.controller";
import { login, logout, refresh } from "../controllers/auth.controller";

const router = express.Router();

// Event routes
router.post("/events", upload.single("image"), createEvent);
router.get("/events", getAllEvents);
router.get("/events/:id", getEventById);
router.put("/events/:id", upload.single("image"), updateEvent);
router.delete("/events/:id", deleteEvent);

// Registration routes
router.post("/registrations", createRegistration);
router.get("/registrations", getAllRegistrations);
router.get("/registrations/event/:eventId", getRegistrationsByEvent);
router.get("/registrations/:id", getRegistrationById);
router.put("/registrations/:id", updateRegistration);
router.delete("/registrations/:id", deleteRegistration);

// User routes
router.post("/users/create", createUser);

// Auth routes
router.post("/auth/login", login);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", logout);
export default router;
