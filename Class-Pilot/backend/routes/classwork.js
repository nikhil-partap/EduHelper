import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createSection,
  getClasswork,
  addItemToSection,
  updateSection,
  deleteSection,
  removeItemFromSection,
  getClassPeople,
} from "../controllers/classworkController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/classwork/section - Create section (teacher only)
router.post("/section", authorize("teacher"), createSection);

// GET /api/classwork/class/:classId - Get organized classwork
router.get("/class/:classId", getClasswork);

// GET /api/classwork/class/:classId/people - Get class members
router.get("/class/:classId/people", getClassPeople);

// POST /api/classwork/section/:sectionId/item - Add item to section (teacher only)
router.post("/section/:sectionId/item", authorize("teacher"), addItemToSection);

// PUT /api/classwork/section/:sectionId - Update section (teacher only)
router.put("/section/:sectionId", authorize("teacher"), updateSection);

// DELETE /api/classwork/section/:sectionId - Delete section (teacher only)
router.delete("/section/:sectionId", authorize("teacher"), deleteSection);

// DELETE /api/classwork/section/:sectionId/item/:itemId - Remove item (teacher only)
router.delete(
  "/section/:sectionId/item/:itemId",
  authorize("teacher"),
  removeItemFromSection
);

export default router;
