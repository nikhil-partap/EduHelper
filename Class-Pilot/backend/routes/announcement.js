import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  postAnnouncement,
  getClassStream,
  getRecentAnnouncements,
  addComment,
  deleteAnnouncement,
  togglePinAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/announcement/post - Create announcement (teacher only)
router.post("/post", authorize("teacher"), postAnnouncement);

// GET /api/announcement/recent - Get recent announcements across all classes
router.get("/recent", getRecentAnnouncements);

// GET /api/announcement/class/:classId - Get class stream
router.get("/class/:classId", getClassStream);

// POST /api/announcement/:announcementId/comment - Add comment
router.post("/:announcementId/comment", addComment);

// PUT /api/announcement/:announcementId/pin - Toggle pin (teacher only)
router.put("/:announcementId/pin", authorize("teacher"), togglePinAnnouncement);

// DELETE /api/announcement/:announcementId - Delete announcement (teacher only)
router.delete("/:announcementId", authorize("teacher"), deleteAnnouncement);

export default router;
