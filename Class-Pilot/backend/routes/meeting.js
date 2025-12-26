// File: /backend/routes/meeting.js

import express from "express";
import {
  createMeeting,
  getClassMeetings,
  getMeeting,
  updateMeetingStatus,
  joinMeeting,
  leaveMeeting,
  updateMeeting,
  deleteMeeting,
  getUpcomingMeetings,
} from "../controllers/meetingController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Teacher routes
router.post("/create", createMeeting);
router.put("/:meetingId/status", updateMeetingStatus);
router.put("/:meetingId", updateMeeting);
router.delete("/:meetingId", deleteMeeting);

// Student routes
router.post("/:meetingId/join", joinMeeting);
router.post("/:meetingId/leave", leaveMeeting);

// Shared routes
router.get("/upcoming", getUpcomingMeetings);
router.get("/class/:classId", getClassMeetings);
router.get("/:meetingId", getMeeting);

export default router;
