// Reset user password script
// Run: node reset-password.js <email> <newPassword>
// Example: node reset-password.js bob@school.edu student123

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from parent directory
dotenv.config({ path: join(__dirname, "..", ".env") });

const email = process.argv[2];
const newPassword = process.argv[3] || "secret123";

if (!email) {
  console.log("Usage: node reset-password.js <email> [newPassword]");
  console.log("Example: node reset-password.js bob@school.edu student123");
  process.exit(1);
}

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    // Find user
    const user = await mongoose.connection.db
      .collection("users")
      .findOne({ email });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      console.log("\nExisting users:");
      const users = await mongoose.connection.db
        .collection("users")
        .find({}, { projection: { email: 1, name: 1, role: 1 } })
        .limit(10)
        .toArray();
      users.forEach((u) => console.log(`  - ${u.email} (${u.role})`));
      process.exit(1);
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await mongoose.connection.db
      .collection("users")
      .updateOne({ email }, { $set: { password: hash } });

    console.log("✅ Password reset successful!\n");
    console.log("Login Credentials:");
    console.log("==================");
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    console.log(`Role: ${user.role}`);
    console.log(`Name: ${user.name}`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetPassword();
