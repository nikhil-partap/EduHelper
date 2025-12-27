import mongoose from "mongoose";

const classworkItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["assignment", "quiz", "material"],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "items.itemModel",
    },
    itemModel: {
      type: String,
      enum: ["Assignment", "Quiz"],
    },
    // For materials (files/links) that don't have a separate model
    material: {
      title: String,
      description: String,
      url: String,
      fileType: String,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const classworkSectionSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    sectionName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    order: {
      type: Number,
      default: 0,
    },
    items: [classworkItemSchema],
  },
  { timestamps: true }
);

// Index for efficient queries
classworkSectionSchema.index({ classId: 1, order: 1 });

export default mongoose.model("ClassworkSection", classworkSectionSchema);
