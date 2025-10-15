// File: /backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    role: {
      type: String,
      required: true,
      enum: ["teacher", "student"],
      default: "user",
    },
    schoolName: {
      type: String,
      // This field is only required if the role is 'teacher'
      required: function () {
        return this.role === "teacher";
      },
      trim: true,
    },
    rollNumber: {
      type: String,
      // This field is only required if the role is 'student'
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// hashing the password before saving
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(3);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// now i have to compare the incoming passwords with the hash password
userSchema.method.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema, "user");
export default User;

// Schema should have:

// email (unique, required)
// password (required, will be hashed)
// name (required)
// role (enum: 'teacher' or 'student')
// schoolName (for teachers only)
// rollNumber (for students only)
// timestamps (createdAt, updatedAt)
