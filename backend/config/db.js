import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Set strictQuery to false to prepare for Mongoose 7's default
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
