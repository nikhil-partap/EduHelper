// File: /backend/controllers/meetingController.js

import Meeting from "../models/Meeting.js";
import Class from "../models/Class.js";

// Helper: ensure teacher owns the class
async function assertTeacherOwnsClass(teacherId, classId) {
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    throw Object.assign(new Error("Class not found"), { status: 404 });
  }
  if (!classDoc.teacherId.equals(teacherId)) {
    throw Object.assign(new Error("You are not the teacher of this class"), {
      status: 403,
    });
  }
  return classDoc;
}

// @desc Create a new meeting
// @route POST /api/meeting/create
// @access Private (Teacher only)
export const createMeeting = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can create meetings" });
    }

    const {
      classId,
      title,
      description,
      meetLink,
      meetingType,
      scheduledAt,
      duration,
      isRecurring,
      recurringPattern,
    } = req.body;

    if (!classId || !title || !meetLink || !scheduledAt) {
      return res
        .status(400)
        .json({
          message: "classId, title, meetLink, and scheduledAt are required",
        });
    }

    await assertTeacherOwnsClass(req.user._id, classId);

    const meeting = await Meeting.create({
      classId,
      teacherId: req.user._id,
      title,
      description,
      meetLink,
      meetingType: meetingType || "google_meet",
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      isRecurring,
      recurringPattern,
    });

    res.status(201).json({ meeting });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Get all meetings for a class
// @route GET /api/meeting/class/:classId
// @access Private
export const getClassMeetings = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { status, upcoming } = req.query;

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    const isTeacher =
      req.user.role === "teacher" && classDoc.teacherId.equals(req.user._id);
    const isStudent =
      req.user.role === "student" &&
      classDoc.students.some((s) => s.equals(req.user._id));

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Access denied" });
    }

    const filter = { classId };
    if (status) filter.status = status;
    if (upcoming === "true") {
      filter.scheduledAt = { $gte: new Date() };
      filter.status = { $in: ["scheduled", "live"] };
    }

    const meetings = await Meeting.find(filter)
      .populate("teacherId", "name email")
      .sort({ scheduledAt: 1 });

    res.status(200).json({ meetings });
  } catch (err) {
    next(err);
  }
};

// @desc Get single meeting
// @route GET /api/meeting/:meetingId
// @access Private
export const getMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId)
      .populate("teacherId", "name email")
      .populate("classId", "className subject")
      .populate("attendees.studentId", "name rollNumber");

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const classDoc = await Class.findById(meeting.classId);
    const isTeacher =
      req.user.role === "teacher" && classDoc.teacherId.equals(req.user._id);
    const isStudent =
      req.user.role === "student" &&
      classDoc.students.some((s) => s.equals(req.user._id));

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ meeting });
  } catch (err) {
    next(err);
  }
};

// @desc Update meeting status (start/end)
// @route PUT /api/meeting/:meetingId/status
// @access Private (Teacher only)
export const updateMeetingStatus = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can update meeting status" });
    }

    const { meetingId } = req.params;
    const { status } = req.body;

    if (!["scheduled", "live", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    await assertTeacherOwnsClass(req.user._id, meeting.classId);

    meeting.status = status;
    await meeting.save();

    res.status(200).json({ meeting });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Join meeting (Student marks attendance)
// @route POST /api/meeting/:meetingId/join
// @access Private (Student only)
export const joinMeeting = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can join meetings" });
    }

    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const classDoc = await Class.findById(meeting.classId);
    if (!classDoc.students.some((s) => s.equals(req.user._id))) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this class" });
    }

    // Check if already joined
    const existingAttendee = meeting.attendees.find((a) =>
      a.studentId.equals(req.user._id)
    );
    if (existingAttendee) {
      return res
        .status(200)
        .json({ message: "Already joined", meetLink: meeting.meetLink });
    }

    meeting.attendees.push({
      studentId: req.user._id,
      joinedAt: new Date(),
      attended: true,
    });

    await meeting.save();

    res
      .status(200)
      .json({ message: "Joined successfully", meetLink: meeting.meetLink });
  } catch (err) {
    next(err);
  }
};

// @desc Leave meeting (Student)
// @route POST /api/meeting/:meetingId/leave
// @access Private (Student only)
export const leaveMeeting = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can leave meetings" });
    }

    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const attendee = meeting.attendees.find((a) =>
      a.studentId.equals(req.user._id)
    );
    if (attendee) {
      attendee.leftAt = new Date();
      await meeting.save();
    }

    res.status(200).json({ message: "Left meeting" });
  } catch (err) {
    next(err);
  }
};

// @desc Update meeting details
// @route PUT /api/meeting/:meetingId
// @access Private (Teacher only)
export const updateMeeting = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can update meetings" });
    }

    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    await assertTeacherOwnsClass(req.user._id, meeting.classId);

    const allowedUpdates = [
      "title",
      "description",
      "meetLink",
      "scheduledAt",
      "duration",
      "recordingUrl",
    ];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) meeting[field] = req.body[field];
    });

    await meeting.save();
    res.status(200).json({ meeting });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Delete meeting
// @route DELETE /api/meeting/:meetingId
// @access Private (Teacher only)
export const deleteMeeting = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can delete meetings" });
    }

    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    await assertTeacherOwnsClass(req.user._id, meeting.classId);

    await meeting.deleteOne();
    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Get upcoming meetings for user
// @route GET /api/meeting/upcoming
// @access Private
export const getUpcomingMeetings = async (req, res, next) => {
  try {
    let classIds;

    if (req.user.role === "teacher") {
      const classes = await Class.find({ teacherId: req.user._id }).select(
        "_id"
      );
      classIds = classes.map((c) => c._id);
    } else {
      const classes = await Class.find({ students: req.user._id }).select(
        "_id"
      );
      classIds = classes.map((c) => c._id);
    }

    const meetings = await Meeting.find({
      classId: { $in: classIds },
      scheduledAt: { $gte: new Date() },
      status: { $in: ["scheduled", "live"] },
    })
      .populate("classId", "className subject")
      .populate("teacherId", "name")
      .sort({ scheduledAt: 1 })
      .limit(10);

    res.status(200).json({ meetings });
  } catch (err) {
    next(err);
  }
};
