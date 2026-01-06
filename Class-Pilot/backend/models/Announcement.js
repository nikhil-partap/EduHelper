import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const announcementSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["announcement", "assignment", "quiz", "meeting", "material"],
      default: "announcement",
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // Reference to related item (assignment, quiz, meeting)
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel",
    },
    referenceModel: {
      type: String,
      enum: ["Assignment", "Quiz", "Meeting", null],
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
      // true = only visible to class members (Class tab)
      // false = visible to all teachers (Stream tab)
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Index for efficient queries
announcementSchema.index({ classId: 1, createdAt: -1 });
announcementSchema.index({ classId: 1, type: 1 });

export default mongoose.model("Announcement", announcementSchema);
