import ClassworkSection from "../models/ClassworkSection.js";
import Class from "../models/Class.js";
import Assignment from "../models/Assignment.js";
import Quiz from "../models/Quiz.js";

/**
 * @desc    Create a new classwork section/folder
 * @route   POST /api/classwork/section
 * @access  Private (Teacher only)
 */
export const createSection = async (req, res) => {
  try {
    const { classId, sectionName, description } = req.body;

    if (!classId || !sectionName) {
      return res.status(400).json({
        success: false,
        error: "Class ID and section name are required",
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
        error: "Not authorized to create sections in this class",
      });
    }

    // Get max order for new section
    const maxOrder = await ClassworkSection.findOne({ classId })
      .sort({ order: -1 })
      .select("order");

    const section = await ClassworkSection.create({
      classId,
      sectionName,
      description,
      order: maxOrder ? maxOrder.order + 1 : 0,
    });

    res.status(201).json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("Create section error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create section",
    });
  }
};

/**
 * @desc    Get all classwork organized by sections
 * @route   GET /api/classwork/class/:classId
 * @access  Private (Teacher or enrolled student)
 */
export const getClasswork = async (req, res) => {
  try {
    const { classId } = req.params;

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
        error: "Not authorized to view this classwork",
      });
    }

    // Get sections with items
    const sections = await ClassworkSection.find({ classId })
      .sort({ order: 1 })
      .lean();

    // Get all assignments and quizzes for this class
    const [assignments, quizzes] = await Promise.all([
      Assignment.find({ classId }).sort({ createdAt: -1 }).lean(),
      Quiz.find({ classId }).sort({ createdAt: -1 }).lean(),
    ]);

    // Find items not in any section (uncategorized)
    const categorizedAssignmentIds = new Set();
    const categorizedQuizIds = new Set();

    sections.forEach((section) => {
      section.items?.forEach((item) => {
        if (item.itemType === "assignment" && item.itemId) {
          categorizedAssignmentIds.add(item.itemId.toString());
        } else if (item.itemType === "quiz" && item.itemId) {
          categorizedQuizIds.add(item.itemId.toString());
        }
      });
    });

    const uncategorizedAssignments = assignments.filter(
      (a) => !categorizedAssignmentIds.has(a._id.toString())
    );
    const uncategorizedQuizzes = quizzes.filter(
      (q) => !categorizedQuizIds.has(q._id.toString())
    );

    // Populate section items with actual data
    for (const section of sections) {
      if (section.items) {
        for (const item of section.items) {
          if (item.itemType === "assignment" && item.itemId) {
            item.data = assignments.find(
              (a) => a._id.toString() === item.itemId.toString()
            );
          } else if (item.itemType === "quiz" && item.itemId) {
            item.data = quizzes.find(
              (q) => q._id.toString() === item.itemId.toString()
            );
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        sections,
        uncategorized: {
          assignments: uncategorizedAssignments,
          quizzes: uncategorizedQuizzes,
        },
        summary: {
          totalAssignments: assignments.length,
          totalQuizzes: quizzes.length,
          totalSections: sections.length,
        },
      },
    });
  } catch (error) {
    console.error("Get classwork error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch classwork",
    });
  }
};

/**
 * @desc    Add item to section
 * @route   POST /api/classwork/section/:sectionId/item
 * @access  Private (Teacher only)
 */
export const addItemToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { itemType, itemId, material } = req.body;

    if (!itemType) {
      return res.status(400).json({
        success: false,
        error: "Item type is required",
      });
    }

    const section = await ClassworkSection.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        error: "Section not found",
      });
    }

    // Verify teacher owns the class
    const classData = await Class.findById(section.classId);
    if (classData.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    const maxOrder =
      section.items.length > 0
        ? Math.max(...section.items.map((i) => i.order)) + 1
        : 0;

    const newItem = {
      itemType,
      order: maxOrder,
    };

    if (itemType === "material") {
      newItem.material = material;
    } else {
      newItem.itemId = itemId;
      newItem.itemModel = itemType === "assignment" ? "Assignment" : "Quiz";
    }

    section.items.push(newItem);
    await section.save();

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("Add item error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add item to section",
    });
  }
};

/**
 * @desc    Update section
 * @route   PUT /api/classwork/section/:sectionId
 * @access  Private (Teacher only)
 */
export const updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { sectionName, description, order } = req.body;

    const section = await ClassworkSection.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        error: "Section not found",
      });
    }

    // Verify teacher owns the class
    const classData = await Class.findById(section.classId);
    if (classData.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    if (sectionName) section.sectionName = sectionName;
    if (description !== undefined) section.description = description;
    if (order !== undefined) section.order = order;

    await section.save();

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("Update section error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update section",
    });
  }
};

/**
 * @desc    Delete section
 * @route   DELETE /api/classwork/section/:sectionId
 * @access  Private (Teacher only)
 */
export const deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await ClassworkSection.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        error: "Section not found",
      });
    }

    // Verify teacher owns the class
    const classData = await Class.findById(section.classId);
    if (classData.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    await section.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete section error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete section",
    });
  }
};

/**
 * @desc    Remove item from section
 * @route   DELETE /api/classwork/section/:sectionId/item/:itemId
 * @access  Private (Teacher only)
 */
export const removeItemFromSection = async (req, res) => {
  try {
    const { sectionId, itemId } = req.params;

    const section = await ClassworkSection.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        error: "Section not found",
      });
    }

    // Verify teacher owns the class
    const classData = await Class.findById(section.classId);
    if (classData.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    section.items = section.items.filter(
      (item) => item._id.toString() !== itemId
    );
    await section.save();

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("Remove item error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove item",
    });
  }
};

/**
 * @desc    Get class people (students list)
 * @route   GET /api/classwork/class/:classId/people
 * @access  Private (Teacher or enrolled student)
 */
export const getClassPeople = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId)
      .populate("teacherId", "name email schoolName")
      .populate("students", "name email rollNumber");

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    const isTeacher = classData.teacherId._id.toString() === req.user.id;
    const isStudent = classData.students.some(
      (s) => s._id.toString() === req.user.id
    );

    if (!isTeacher && !isStudent) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view class members",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        teacher: classData.teacherId,
        students: classData.students,
        totalStudents: classData.students.length,
      },
    });
  } catch (error) {
    console.error("Get people error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch class members",
    });
  }
};
