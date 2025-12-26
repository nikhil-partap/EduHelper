// File: /backend/controllers/timetableController.js

import Timetable from "../models/Timetable.js";
import Class from "../models/Class.js";

// @desc Create or get user's timetable
// @route POST /api/timetable
// @access Private
export const createTimetable = async (req, res, next) => {
  try {
    const { name, academicYear, semester } = req.body;

    // Check if user already has an active timetable
    let timetable = await Timetable.findOne({
      userId: req.user._id,
      isActive: true,
    });

    if (timetable) {
      return res
        .status(200)
        .json({ timetable, message: "Existing timetable returned" });
    }

    timetable = await Timetable.create({
      userId: req.user._id,
      userRole: req.user.role,
      name: name || "My Timetable",
      academicYear,
      semester,
      slots: [],
    });

    res.status(201).json({ timetable });
  } catch (err) {
    next(err);
  }
};

// @desc Get user's timetable
// @route GET /api/timetable
// @access Private
export const getTimetable = async (req, res, next) => {
  try {
    let timetable = await Timetable.findOne({
      userId: req.user._id,
      isActive: true,
    }).populate("slots.classId", "className subject");

    if (!timetable) {
      // Auto-create if doesn't exist
      timetable = await Timetable.create({
        userId: req.user._id,
        userRole: req.user.role,
        slots: [],
      });
    }

    res.status(200).json({ timetable });
  } catch (err) {
    next(err);
  }
};

// @desc Add a slot to timetable
// @route POST /api/timetable/slot
// @access Private
export const addSlot = async (req, res, next) => {
  try {
    const {
      day,
      startTime,
      endTime,
      subject,
      classId,
      room,
      meetLink,
      notes,
      color,
    } = req.body;

    if (!day || !startTime || !endTime || !subject) {
      return res
        .status(400)
        .json({ message: "day, startTime, endTime, and subject are required" });
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ message: "Time must be in HH:MM format" });
    }

    let timetable = await Timetable.findOne({
      userId: req.user._id,
      isActive: true,
    });
    if (!timetable) {
      timetable = await Timetable.create({
        userId: req.user._id,
        userRole: req.user.role,
        slots: [],
      });
    }

    // Check for time conflicts
    const hasConflict = timetable.slots.some((slot) => {
      if (slot.day !== day) return false;
      return startTime < slot.endTime && endTime > slot.startTime;
    });

    if (hasConflict) {
      return res
        .status(400)
        .json({ message: "Time slot conflicts with existing schedule" });
    }

    timetable.slots.push({
      day,
      startTime,
      endTime,
      subject,
      classId,
      room,
      meetLink,
      notes,
      color: color || "#3B82F6",
    });

    await timetable.save();
    res.status(200).json({ timetable });
  } catch (err) {
    next(err);
  }
};

// @desc Update a slot
// @route PUT /api/timetable/slot/:slotId
// @access Private
export const updateSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    const timetable = await Timetable.findOne({
      userId: req.user._id,
      isActive: true,
    });
    if (!timetable)
      return res.status(404).json({ message: "Timetable not found" });

    const slot = timetable.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    const allowedUpdates = [
      "day",
      "startTime",
      "endTime",
      "subject",
      "classId",
      "room",
      "meetLink",
      "notes",
      "color",
    ];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) slot[field] = req.body[field];
    });

    await timetable.save();
    res.status(200).json({ timetable });
  } catch (err) {
    next(err);
  }
};

// @desc Delete a slot
// @route DELETE /api/timetable/slot/:slotId
// @access Private
export const deleteSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    const timetable = await Timetable.findOne({
      userId: req.user._id,
      isActive: true,
    });
    if (!timetable)
      return res.status(404).json({ message: "Timetable not found" });

    const slot = timetable.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    slot.deleteOne();
    await timetable.save();

    res.status(200).json({ message: "Slot deleted", timetable });
  } catch (err) {
    next(err);
  }
};

// @desc Get schedule for a specific day
// @route GET /api/timetable/day/:day
// @access Private
export const getDaySchedule = async (req, res, next) => {
  try {
    const { day } = req.params;
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    if (!validDays.includes(day)) {
      return res.status(400).json({ message: "Invalid day" });
    }

    const timetable = await Timetable.findOne({
      userId: req.user._id,
      isActive: true,
    }).populate("slots.classId", "className subject");

    if (!timetable) {
      return res.status(200).json({ slots: [] });
    }

    const daySlots = timetable.slots
      .filter((slot) => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    res.status(200).json({ day, slots: daySlots });
  } catch (err) {
    next(err);
  }
};

// @desc Auto-populate timetable from enrolled classes (Student)
// @route POST /api/timetable/auto-populate
// @access Private (Student only)
export const autoPopulateFromClasses = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can auto-populate from classes" });
    }

    const classes = await Class.find({ students: req.user._id }).populate(
      "teacherId",
      "name"
    );

    let timetable = await Timetable.findOne({
      userId: req.user._id,
      isActive: true,
    });
    if (!timetable) {
      timetable = await Timetable.create({
        userId: req.user._id,
        userRole: req.user.role,
        slots: [],
      });
    }

    // Add class schedules to timetable
    let added = 0;
    for (const cls of classes) {
      if (cls.schedule && cls.schedule.days) {
        for (const day of cls.schedule.days) {
          const exists = timetable.slots.some(
            (s) => s.day === day && s.classId?.toString() === cls._id.toString()
          );

          if (!exists) {
            timetable.slots.push({
              day,
              startTime: cls.schedule.startTime || "09:00",
              endTime: cls.schedule.endTime || "10:00",
              subject: cls.subject,
              classId: cls._id,
              notes: `Teacher: ${cls.teacherId?.name || "TBA"}`,
            });
            added++;
          }
        }
      }
    }

    await timetable.save();
    res
      .status(200)
      .json({
        timetable,
        message: `Added ${added} slots from enrolled classes`,
      });
  } catch (err) {
    next(err);
  }
};
