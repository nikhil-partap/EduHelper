const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a class name"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please specify a teacher"],
  },
  teacherName: {
    type: String,
    required: true,
  },
  students: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      enrolledAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  schedule: {
    type: String,
    default: "",
  },
  room: {
    type: String,
    default: "",
  },
  capacity: {
    type: Number,
    default: 30,
  },
  color: {
    type: String,
    default: "blue",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for enrolled count
classSchema.virtual("enrolled").get(function () {
  return this.students.length;
});

// Update the updatedAt timestamp before saving
classSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure virtuals are included in JSON
classSchema.set("toJSON", {virtuals: true});
classSchema.set("toObject", {virtuals: true});

module.exports = mongoose.model("Class", classSchema);
