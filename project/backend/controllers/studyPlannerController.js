// File: /backend/controllers/studyPlannerController.js

import mongoose from "mongoose";
import StudyPlanner from "../models/StudyPlanner.js";
import Class from "../models/Class.js";

// --- Helpers ---

const normalizeUTC = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const isWeekend = (d) => {
  const day = d.getUTCDay(); // 0=Sun, 6=Sat
  return day === 0 || day === 6;
};

const nextWorkingDay = (d, holidaySet) => {
  const x = normalizeUTC(d);
  while (isWeekend(x) || holidaySet.has(x.getTime())) {
    x.setUTCDate(x.getUTCDate() + 1);
  }
  return x;
};

// Return next N working days window start->end, skipping weekends/holidays
const spanWorkingDays = (startDate, days, holidaySet) => {
  let start = nextWorkingDay(startDate, holidaySet);
  let remaining = Math.max(1, days);
  const end = new Date(start);

  while (remaining > 1) {
    end.setUTCDate(end.getUTCDate() + 1);
    const candidate = normalizeUTC(end);
    if (!isWeekend(candidate) && !holidaySet.has(candidate.getTime())) {
      remaining -= 1;
    }
  }
  return { start, end: normalizeUTC(end) };
};

// Academic year window (Jan–Dec; adjust easily to Apr–Mar if needed)
const academicYearWindow = (year) => {
  const start = new Date(Date.UTC(year, 0, 1)); // Jan 1
  const end = new Date(Date.UTC(year, 11, 31)); // Dec 31
  return { start, end };
};

// --- Placeholder AI generator (replace with actual API call) ---
async function generateChaptersWithAI({ board, className }) {
  // TODO: integrate OpenAI/Gemini using the provided prompt template.
  // For now, mock a syllabus with durationDays between 1–3 per chapter.
  const syllabus = [
    "Numbers & Operations",
    "Algebra Basics",
    "Geometry Fundamentals",
    "Mensuration",
    "Data Handling",
    "Trigonometry Intro",
    "Coordinate Geometry",
    "Probability Basics",
  ];
  return {
    chapters: syllabus.map((title) => ({
      chapterName: title,
      durationDays: Math.floor(Math.random() * 3) + 1, // 1-3 days
    })),
  };
}

// --- Access control ---
async function assertTeacherOwnsClass(teacherId, classId) {
  const classDoc = await Class.findById(classId);
  if (!classDoc)
    throw Object.assign(new Error("Class not found"), { status: 404 });
  if (!classDoc.teacherId.equals(teacherId)) {
    throw Object.assign(new Error("You are not the teacher of this class"), {
      status: 403,
    });
  }
  return classDoc;
}

// --- Controller functions ---

// Generate planner: AI supplies chapter names + durationDays; we compute dates
export const generateStudyPlanner = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can generate study planners" });
    }

    const { classId, board, className } = req.body;
    if (!classId || !board || !className) {
      return res
        .status(400)
        .json({ message: "classId, board, className are required" });
    }

    await assertTeacherOwnsClass(req.user._id, classId);

    // Build prompt (for real AI call)
    const prompt = `
Generate a study plan for ${board} ${className} with all chapters.
Consider:
- Weekends excluded
- Academic year from January to December
- Each chapter needs at least 1-3 days

Return JSON:
{
  "chapters": [
    { "chapterName": "...", "durationDays": 3 }
  ]
}
`.trim();

    // TODO: send 'prompt' to AI and parse JSON safely.
    const aiResult = await generateChaptersWithAI({ board, className });
    if (!aiResult?.chapters || aiResult.chapters.length === 0) {
      return res.status(502).json({ message: "Failed to generate chapters" });
    }

    // Compute timeline
    const year = new Date().getUTCFullYear();
    const { start, end } = academicYearWindow(year);
    const HOLIDAYS = new Set(); // initial empty; teacher can add later
    const bufferDays = 1; // buffer between chapters

    let cursor = normalizeUTC(start);
    const chaptersWithDates = [];

    for (const ch of aiResult.chapters) {
      // Ensure buffer before each chapter
      for (let b = 0; b < bufferDays; ) {
        cursor.setUTCDate(cursor.getUTCDate() + 1);
        const c = normalizeUTC(cursor);
        if (!isWeekend(c) && !HOLIDAYS.has(c.getTime())) b++;
      }

      const { start: chStart, end: chEnd } = spanWorkingDays(
        cursor,
        ch.durationDays,
        HOLIDAYS
      );
      chaptersWithDates.push({
        chapterName: ch.chapterName,
        startDate: chStart,
        endDate: chEnd,
        durationDays: ch.durationDays,
        topics: undefined,
      });

      // Advance cursor to the day after chapter end
      cursor = new Date(chEnd);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      // Stop if beyond academic year
      if (cursor > end) break;
    }

    const planner = await StudyPlanner.create({
      classId,
      teacherId: req.user._id,
      board,
      className,
      chapters: chaptersWithDates,
      holidays: [],
      examDates: [],
      generatedAt: new Date(),
    });

    res.status(201).json({ planner });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// Get full planner (teacher + student)
export const getStudyPlanner = async (req, res, next) => {
  try {
    const { classId } = req.params;
    if (!classId)
      return res.status(400).json({ message: "classId is required" });

    const planner = await StudyPlanner.findOne({ classId });
    if (!planner)
      return res.status(404).json({ message: "Study planner not found" });

    // Access: teacher of class or enrolled student
    const classDoc = await Class.findById(classId).populate("students", "_id");
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    const isTeacher =
      req.user.role === "teacher" && classDoc.teacherId.equals(req.user._id);
    const isStudent =
      req.user.role === "student" &&
      classDoc.students.some((s) => s._id.equals(req.user._id));
    if (!isTeacher && !isStudent)
      return res.status(403).json({ message: "Access denied" });

    res.status(200).json({ planner });
  } catch (err) {
    next(err);
  }
};

// Update a chapter's dates or duration (teacher only) and shift subsequent chapters
export const updateChapter = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can update chapters" });
    }

    const { classId } = req.params;
    const { chapterIndex, newStartDate, newEndDate, durationDays } = req.body;
    if (chapterIndex == null)
      return res.status(400).json({ message: "chapterIndex is required" });

    await assertTeacherOwnsClass(req.user._id, classId);

    const planner = await StudyPlanner.findOne({ classId });
    if (!planner)
      return res.status(404).json({ message: "Study planner not found" });
    if (!planner.chapters[chapterIndex])
      return res.status(404).json({ message: "Chapter not found" });

    const holidaySet = new Set(
      (planner.holidays || []).map((d) => normalizeUTC(d).getTime())
    );

    // Update target chapter
    const target = planner.chapters[chapterIndex];
    if (durationDays != null) {
      target.durationDays = Math.max(1, Number(durationDays));
    }
    if (newStartDate || newEndDate || durationDays != null) {
      const start = newStartDate
        ? normalizeUTC(newStartDate)
        : normalizeUTC(target.startDate);
      const dur = target.durationDays || 1;
      let end = newEndDate ? normalizeUTC(newEndDate) : null;
      if (!end) {
        const span = spanWorkingDays(start, dur, holidaySet);
        end = span.end;
      }
      target.startDate = nextWorkingDay(start, holidaySet);
      target.endDate = end;
    }

    // Shift subsequent chapters to start after the updated one, with 1-day buffer
    let cursor = new Date(target.endDate);
    cursor.setUTCDate(cursor.getUTCDate() + 1);

    for (let i = chapterIndex + 1; i < planner.chapters.length; i++) {
      const ch = planner.chapters[i];
      const span = spanWorkingDays(cursor, ch.durationDays || 1, holidaySet);
      ch.startDate = span.start;
      ch.endDate = span.end;
      cursor = new Date(ch.endDate);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    planner.lastEditedAt = new Date();
    await planner.save();

    res.status(200).json({ planner });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// Add a holiday (teacher only) and recompute chapter durations
export const addHoliday = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can add holidays" });
    }
    const { classId } = req.params;
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: "date is required" });

    await assertTeacherOwnsClass(req.user._id, classId);

    const planner = await StudyPlanner.findOne({ classId });
    if (!planner)
      return res.status(404).json({ message: "Study planner not found" });

    const d = normalizeUTC(date);
    const existing = (planner.holidays || []).map((x) =>
      normalizeUTC(x).getTime()
    );
    if (!existing.includes(d.getTime())) {
      planner.holidays.push(d);
    }

    planner.lastEditedAt = new Date();
    await planner.save();
    res.status(200).json({ planner });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// Remove a holiday (teacher only)
export const removeHoliday = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can remove holidays" });
    }
    const { classId } = req.params;
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: "date is required" });

    await assertTeacherOwnsClass(req.user._id, classId);

    const planner = await StudyPlanner.findOne({ classId });
    if (!planner)
      return res.status(404).json({ message: "Study planner not found" });

    const target = normalizeUTC(date).getTime();
    planner.holidays = (planner.holidays || []).filter(
      (d) => normalizeUTC(d).getTime() !== target
    );

    planner.lastEditedAt = new Date();
    await planner.save();
    res.status(200).json({ planner });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// Add an exam date (teacher only)
export const addExamDate = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can add exam dates" });
    }
    const { classId } = req.params;
    const { examName, date } = req.body;
    if (!examName || !date)
      return res
        .status(400)
        .json({ message: "examName and date are required" });

    await assertTeacherOwnsClass(req.user._id, classId);

    const planner = await StudyPlanner.findOne({ classId });
    if (!planner)
      return res.status(404).json({ message: "Study planner not found" });

    const d = normalizeUTC(date);
    planner.examDates.push({ examName, date: d });
    planner.lastEditedAt = new Date();
    await planner.save();

    res.status(200).json({ planner });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// Update an exam date (teacher only)
export const updateExamDate = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can update exam dates" });
    }
    const { classId } = req.params;
    const { examName, newDate } = req.body;
    if (!examName || !newDate)
      return res
        .status(400)
        .json({ message: "examName and newDate are required" });

    await assertTeacherOwnsClass(req.user._id, classId);

    const planner = await StudyPlanner.findOne({ classId });
    if (!planner)
      return res.status(404).json({ message: "Study planner not found" });

    const idx = (planner.examDates || []).findIndex(
      (e) => e.examName === examName
    );
    if (idx === -1) return res.status(404).json({ message: "Exam not found" });

    planner.examDates[idx].date = normalizeUTC(newDate);
    planner.lastEditedAt = new Date();
    await planner.save();

    res.status(200).json({ planner });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};
