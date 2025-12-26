// File: /backend/routes/timetable.js

import express from "express";
import {
  createTimetable,
  getTimetable,
  addSlot,
  updateSlot,
  deleteSlot,
  getDaySchedule,
  autoPopulateFromClasses,
} from "../controllers/timetableController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Timetable CRUD
router.post("/", createTimetable);
router.get("/", getTimetable);

// Slot management
router.post("/slot", addSlot);
router.put("/slot/:slotId", updateSlot);
router.delete("/slot/:slotId", deleteSlot);

// Schedule views
router.get("/day/:day", getDaySchedule);

// Auto-populate (Student only)
router.post("/auto-populate", autoPopulateFromClasses);

export default router;
