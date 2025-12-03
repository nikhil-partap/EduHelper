// File: /backend/models/Class.js

import mongoose from "mongoose";
import {customAlphabet} from "nanoid";

// imports

// generate a 6-char alphanumeric code
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

//define the schema - className , subject , board, classCode , teacherId , students , timestamp
const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    board: {
      type: String,
      required: true,
      trim: true,
    },
    classCode: {
      type: String,
      unique: true,
      uppercase: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate a unique classCode before first save
classSchema.pre("save", async function (next) {
  //  classSchema.pre this tells the mongoose for the Class Schema i  want to to something pre-(before) an event
  if (!this.isNew) return next(); // if this is not new or is being updated then don`t remake the classCode

  // Build until we find a non-conflicting code
  let code;
  let exists = true;

  while (exists) {
    const prefix = this.subject.replace(/\s+/g, "").slice(0, 4).toUpperCase(); // first remove spaces"Computer Science" → "ComputerScience"  then takes the first four characters of the result. ComputerScience" → "comp"  then characters "comp" → "COMP"
    code = `${prefix}-${nanoid()}`; // combine the prefix with the random generated string with a - in between
    // this checks if the code generated is not generated before
    exists = await mongoose.models.Class.exists({classCode: code}); // here it checks if this same code is used in the database before ot prevent duplicates
  }

  this.classCode = code; // finally assign the code to classCode field of the schema in the database
  next();
});

export default mongoose.model("Class", classSchema);
