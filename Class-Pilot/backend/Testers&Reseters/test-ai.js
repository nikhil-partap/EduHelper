// Quick test for Gemini AI connection
import dotenv from "dotenv";
dotenv.config();

import { generateQuizQuestions, testAIConnection } from "../utils/aiService.js";

async function testAI() {
  console.log("🧪 Testing Gemini AI Connection...\n");
  console.log(
    "API Key configured:",
    process.env.GEMINI_API_KEY ? "Yes ✅" : "No ❌"
  );
  console.log("Provider:", process.env.AI_PROVIDER || "gemini");
  console.log("");

  try {
    // Test connection
    console.log("📡 Testing AI connection...");
    const connectionTest = await testAIConnection("gemini");

    if (connectionTest.success) {
      console.log("✅ Connection successful!");
      console.log("Sample question:", connectionTest.sampleQuestion?.question);
    } else {
      console.log("❌ Connection failed:", connectionTest.message);
      return;
    }

    console.log("\n📝 Generating a sample quiz...");
    const questions = await generateQuizQuestions({
      topic: "JavaScript",
      chapter: "Variables and Data Types",
      numberOfQuestions: 2,
      difficultyLevel: "easy",
      provider: "gemini",
    });

    console.log("✅ Quiz generated successfully!");
    console.log(`Generated ${questions.length} questions:\n`);

    questions.forEach((q, i) => {
      console.log(`Q${i + 1}: ${q.question}`);
      q.options.forEach((opt, j) => {
        const marker = j === q.correctAnswer ? "✓" : " ";
        console.log(`  ${marker} ${j + 1}. ${opt}`);
      });
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAI();
