const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import models
const User = require("../models/User");
const Class = require("../models/Class");
const Assignment = require("../models/Assignment");
const Timetable = require("../models/Timetable");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Seed data
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Class.deleteMany({});
    await Assignment.deleteMany({});
    await Timetable.deleteMany({});
    console.log("✅ Existing data cleared\n");

    // Create users
    console.log("👥 Creating users...");
    const hashedPassword = await bcrypt.hash("password", 10);

    const teacher1 = await User.create({
      name: "Dr. Sarah Johnson",
      email: "teacher@classpilot.com",
      password: hashedPassword,
      role: "teacher",
    });

    const teacher2 = await User.create({
      name: "Prof. Michael Chen",
      email: "michael.chen@classpilot.com",
      password: hashedPassword,
      role: "teacher",
    });

    const students = await User.insertMany([
      {
        name: "John Doe",
        email: "student@classpilot.com",
        password: hashedPassword,
        role: "student",
      },
      {
        name: "Jane Smith",
        email: "jane.smith@classpilot.com",
        password: hashedPassword,
        role: "student",
      },
      {
        name: "Mike Johnson",
        email: "mike.johnson@classpilot.com",
        password: hashedPassword,
        role: "student",
      },
      {
        name: "Sarah Wilson",
        email: "sarah.wilson@classpilot.com",
        password: hashedPassword,
        role: "student",
      },
      {
        name: "Emily Brown",
        email: "emily.brown@classpilot.com",
        password: hashedPassword,
        role: "student",
      },
    ]);
    console.log(`✅ Created ${students.length + 2} users\n`);

    // Create classes
    console.log("📚 Creating classes...");
    const class1 = await Class.create({
      name: "Mathematics 101",
      description: "Introduction to Algebra and Basic Mathematics",
      teacher: teacher1._id,
      teacherName: teacher1.name,
      schedule: "Mon, Wed, Fri 9:00 AM",
      room: "Room 204",
      capacity: 30,
      color: "blue",
      students: [
        {student: students[0]._id},
        {student: students[1]._id},
        {student: students[2]._id},
      ],
    });

    const class2 = await Class.create({
      name: "Physics 201",
      description: "Introduction to Classical Physics",
      teacher: teacher1._id,
      teacherName: teacher1.name,
      schedule: "Tue, Thu 11:00 AM",
      room: "Lab 3",
      capacity: 25,
      color: "purple",
      students: [{student: students[1]._id}, {student: students[3]._id}],
    });

    const class3 = await Class.create({
      name: "Chemistry 301",
      description: "Organic Chemistry Fundamentals",
      teacher: teacher1._id,
      teacherName: teacher1.name,
      schedule: "Mon, Wed 2:00 PM",
      room: "Lab 5",
      capacity: 20,
      color: "green",
      students: [{student: students[0]._id}, {student: students[4]._id}],
    });
    console.log("✅ Created 3 classes\n");

    // Create assignments
    console.log("📝 Creating assignments...");
    await Assignment.insertMany([
      {
        title: "Algebra Basics",
        description: "Complete exercises 1-20 from Chapter 3",
        class: class1._id,
        className: class1.name,
        teacher: teacher1._id,
        teacherName: teacher1.name,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxPoints: 100,
        status: "active",
        submissions: [
          {
            student: students[0]._id,
            studentName: students[0].name,
            submission: "Completed all exercises",
            score: 92,
            status: "graded",
            gradedAt: new Date(),
          },
        ],
      },
      {
        title: "Linear Equations",
        description: "Solve the linear equation problems in the worksheet",
        class: class1._id,
        className: class1.name,
        teacher: teacher1._id,
        teacherName: teacher1.name,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        maxPoints: 100,
        status: "draft",
      },
      {
        title: "Motion and Forces",
        description: "Lab report on Newton's laws of motion experiment",
        class: class2._id,
        className: class2.name,
        teacher: teacher1._id,
        teacherName: teacher1.name,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        maxPoints: 150,
        status: "active",
      },
    ]);
    console.log("✅ Created 3 assignments\n");

    // Create timetable for teacher
    console.log("📅 Creating timetable...");
    await Timetable.create({
      teacher: teacher1._id,
      schedule: [
        {
          day: "Monday",
          slots: [
            "Math 9:00 AM",
            "Physics 11:00 AM",
            "Free",
            "Chemistry 2:00 PM",
          ],
        },
        {
          day: "Tuesday",
          slots: ["Free", "Math 10:00 AM", "Physics 1:00 PM", "Free"],
        },
        {
          day: "Wednesday",
          slots: [
            "Math 9:00 AM",
            "Free",
            "Chemistry 12:00 PM",
            "Physics 3:00 PM",
          ],
        },
        {
          day: "Thursday",
          slots: [
            "Physics 9:00 AM",
            "Math 11:00 AM",
            "Free",
            "Chemistry 2:00 PM",
          ],
        },
        {
          day: "Friday",
          slots: ["Free", "Chemistry 10:00 AM", "Math 1:00 PM", "Free"],
        },
      ],
    });
    console.log("✅ Created timetable\n");

    console.log("🎉 Database seeded successfully!\n");
    console.log("📋 Summary:");
    console.log(
      `   - Users: ${students.length + 2} (2 teachers, ${
        students.length
      } students)`
    );
    console.log("   - Classes: 3");
    console.log("   - Assignments: 3");
    console.log("   - Timetables: 1\n");
    console.log("🔑 Login Credentials:");
    console.log("   Teacher: teacher@classpilot.com / password");
    console.log("   Student: student@classpilot.com / password\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

// Run seed
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log("👋 Database connection closed");
  process.exit(0);
};

runSeed();
