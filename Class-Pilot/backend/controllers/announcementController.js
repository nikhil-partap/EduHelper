import Announcement from "../models/Announcement.js";
import Class from "../models/Class.js";

/**
 * @desc    Post a new announcement
 * @route   POST /api/announcement/post
 * @access  Private (Teacher only)
 */
export const postAnnouncement = async (req, res) => {
  try {
    const {
      classId,
      type,
      title,
      content,
      referenceId,
      referenceModel,
      attachments,
      isPrivate = false,
    } = req.body;

    if (!classId || !content) {
      return res.status(400).json({
        success: false,
        error: "Class ID and content are required",
      });
    }

    // Verify class exists and teacher owns it
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    if (classData.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to post in this class",
      });
    }

    const announcement = await Announcement.create({
      classId,
      teacherId: req.user.id,
      type: type || "announcement",
      title,
      content,
      referenceId,
      referenceModel,
      attachments,
      isPrivate,
    });

    await announcement.populate("teacherId", "name email");
    await announcement.populate("classId", "className subject");

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Post announcement error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to post announcement",
    });
  }
};

/**
 * @desc    Get public stream (all public announcements across all classes for teachers)
 * @route   GET /api/announcement/stream
 * @access  Private (Teachers see all public, Students see their classes' public)
 */
export const getPublicStream = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const userId = req.user.id;
    const isTeacher = req.user.role === "teacher";

    let query = { isPrivate: false };

    if (isTeacher) {
      // Teachers see all public announcements from all classes
      // No class filter needed
    } else {
      // Students only see public announcements from their enrolled classes
      const classes = await Class.find({ students: userId }).select("_id");
      const classIds = classes.map((c) => c._id);
      query.classId = { $in: classIds };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .populate("teacherId", "name email")
        .populate("classId", "className subject")
        .populate("comments.userId", "name email role")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Announcement.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: announcements.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: announcements,
    });
  } catch (error) {
    console.error("Get public stream error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stream",
    });
  }
};

/**
 * @desc    Get class-specific announcements (private + public for that class)
 * @route   GET /api/announcement/class/:classId
 * @access  Private (Teacher or enrolled student)
 */
export const getClassStream = async (req, res) => {
  try {
    const { classId } = req.params;
    const { type, limit = 20, page = 1, privateOnly = false } = req.query;

    // Verify access
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    const isTeacher = classData.teacherId.toString() === req.user.id;
    const isStudent = classData.students.some(
      (s) => s.toString() === req.user.id
    );

    if (!isTeacher && !isStudent) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this class stream",
      });
    }

    // Build query - get all announcements for this class (both private and public)
    const query = { classId };
    if (type) {
      query.type = type;
    }
    // If privateOnly is true, only show private announcements
    if (privateOnly === "true") {
      query.isPrivate = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .populate("teacherId", "name email")
        .populate("comments.userId", "name email role")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Announcement.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: announcements.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: announcements,
    });
  } catch (error) {
    console.error("Get stream error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch class stream",
    });
  }
};

/**
 * @desc    Add comment to announcement
 * @route   POST /api/announcement/:announcementId/comment
 * @access  Private (Teacher or enrolled student)
 */
export const addComment = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Comment content is required",
      });
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: "Announcement not found",
      });
    }

    // Verify access
    const classData = await Class.findById(announcement.classId);
    const isTeacher = classData.teacherId.toString() === req.user.id;
    const isStudent = classData.students.some(
      (s) => s.toString() === req.user.id
    );

    // For private announcements, only class members can comment
    // For public announcements, any teacher can comment
    if (announcement.isPrivate) {
      if (!isTeacher && !isStudent) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to comment",
        });
      }
    } else {
      // Public announcement - teachers can comment, students only if enrolled
      if (req.user.role === "student" && !isStudent) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to comment",
        });
      }
    }

    announcement.comments.push({
      userId: req.user.id,
      content,
    });

    await announcement.save();
    await announcement.populate("comments.userId", "name email role");

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add comment",
    });
  }
};

/**
 * @desc    Delete announcement
 * @route   DELETE /api/announcement/:announcementId
 * @access  Private (Teacher only)
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: "Announcement not found",
      });
    }

    if (announcement.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this announcement",
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete announcement",
    });
  }
};

/**
 * @desc    Toggle pin announcement
 * @route   PUT /api/announcement/:announcementId/pin
 * @access  Private (Teacher only)
 */
export const togglePinAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: "Announcement not found",
      });
    }

    if (announcement.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Toggle pin error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to toggle pin",
    });
  }
};

/**
 * @desc    Get recent announcements across all user's classes
 * @route   GET /api/announcement/recent
 * @access  Private
 */
export const getRecentAnnouncements = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const userId = req.user.id;
    const isTeacher = req.user.role === "teacher";

    // Get user's classes
    let classIds = [];
    if (isTeacher) {
      const classes = await Class.find({ teacherId: userId }).select("_id");
      classIds = classes.map((c) => c._id);
    } else {
      const classes = await Class.find({ students: userId }).select("_id");
      classIds = classes.map((c) => c._id);
    }

    if (classIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Get recent announcements from user's classes (both private and public)
    const announcements = await Announcement.find({
      classId: { $in: classIds },
    })
      .populate("teacherId", "name email")
      .populate("classId", "className subject")
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error("Get recent announcements error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch announcements",
    });
  }
};
