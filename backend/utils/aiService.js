// File: /backend/utils/aiService.js

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize AI clients
let openaiClient = null;
let geminiClient = null;

// Initialize OpenAI
if (
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== "your_openai_api_key_here"
) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Initialize Gemini
if (
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
) {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Generate quiz questions using AI
 * @param {Object} params - Quiz generation parameters
 * @param {string} params.topic - Topic for the quiz
 * @param {string} params.chapter - Chapter name
 * @param {number} params.numberOfQuestions - Number of questions to generate
 * @param {string} params.difficultyLevel - Difficulty level (easy/medium/hard)
 * @param {string} params.provider - AI provider to use ("openai" or "gemini")
 * @returns {Promise<Array>} Array of generated questions
 */
export const generateQuizQuestions = async ({
  topic,
  chapter,
  numberOfQuestions,
  difficultyLevel = "medium",
  provider = process.env.AI_PROVIDER || "gemini",
}) => {
  try {
    // Validate provider
    if (!["openai", "gemini"].includes(provider)) {
      throw new Error(
        `Invalid AI provider: ${provider}. Use "openai" or "gemini"`
      );
    }

    // Check if provider is configured
    if (provider === "openai" && !openaiClient) {
      throw new Error("OpenAI API key not configured");
    }
    if (provider === "gemini" && !geminiClient) {
      throw new Error("Gemini API key not configured");
    }

    // Create the prompt
    const prompt = createQuizPrompt(
      topic,
      chapter,
      numberOfQuestions,
      difficultyLevel
    );

    // Generate questions based on provider
    let questions;
    if (provider === "openai") {
      questions = await generateWithOpenAI(prompt);
    } else {
      questions = await generateWithGemini(prompt);
    }

    // Validate and format questions
    return validateAndFormatQuestions(questions, numberOfQuestions);
  } catch (error) {
    console.error("AI Quiz Generation Error:", error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

/**
 * Create a structured prompt for quiz generation
 */
function createQuizPrompt(topic, chapter, numberOfQuestions, difficultyLevel) {
  return `Generate ${numberOfQuestions} multiple-choice questions for a quiz.

Topic: ${topic}
Chapter: ${chapter}
Difficulty Level: ${difficultyLevel}

Requirements:
- Each question must have exactly 4 options
- Mark the correct answer with its index (0, 1, 2, or 3)
- Questions should be clear and educational
- Options should be plausible but only one correct

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "difficultyLevel": "${difficultyLevel}"
  }
]

Important: Return ONLY the JSON array, no additional text or explanation.`;
}

/**
 * Generate questions using OpenAI
 */
async function generateWithOpenAI(prompt) {
  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educational content creator. Generate quiz questions in valid JSON format only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content.trim();
    return parseAIResponse(content);
  } catch (error) {
    if (error.status === 429) {
      throw new Error("OpenAI rate limit exceeded. Please try again later.");
    }
    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key");
    }
    throw new Error(`OpenAI error: ${error.message}`);
  }
}

/**
 * Generate questions using Google Gemini
 */
async function generateWithGemini(prompt) {
  try {
    const model = geminiClient.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    return parseAIResponse(content);
  } catch (error) {
    if (error.message.includes("API key")) {
      throw new Error("Invalid Gemini API key");
    }
    if (error.message.includes("quota")) {
      throw new Error("Gemini quota exceeded. Please try again later.");
    }
    throw new Error(`Gemini error: ${error.message}`);
  }
}

/**
 * Parse AI response and extract JSON
 */
function parseAIResponse(content) {
  try {
    // Remove markdown code blocks if present
    let jsonStr = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Try to find JSON array in the response
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error("AI returned invalid JSON format");
  }
}

/**
 * Validate and format questions
 */
function validateAndFormatQuestions(questions, expectedCount) {
  if (!Array.isArray(questions)) {
    throw new Error("AI response is not an array");
  }

  if (questions.length === 0) {
    throw new Error("AI generated no questions");
  }

  // Validate each question
  const validQuestions = questions.map((q, index) => {
    // Validate structure
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.correctAnswer === undefined
    ) {
      throw new Error(`Invalid question structure at index ${index}`);
    }

    // Validate options count
    if (q.options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 options`);
    }

    // Validate correct answer index
    if (q.correctAnswer < 0 || q.correctAnswer > 3) {
      throw new Error(`Question ${index + 1} has invalid correctAnswer index`);
    }

    return {
      question: q.question.trim(),
      options: q.options.map((opt) => opt.trim()),
      correctAnswer: q.correctAnswer,
      difficultyLevel: q.difficultyLevel || "medium",
    };
  });

  // Warn if count doesn't match (but don't fail)
  if (validQuestions.length !== expectedCount) {
    console.warn(
      `Expected ${expectedCount} questions but got ${validQuestions.length}`
    );
  }

  return validQuestions;
}

/**
 * Test AI connection
 */
export const testAIConnection = async (provider = "gemini") => {
  try {
    const testQuestions = await generateQuizQuestions({
      topic: "Mathematics",
      chapter: "Basic Arithmetic",
      numberOfQuestions: 1,
      difficultyLevel: "easy",
      provider,
    });

    return {
      success: true,
      provider,
      message: `${provider} connection successful`,
      sampleQuestion: testQuestions[0],
    };
  } catch (error) {
    return {
      success: false,
      provider,
      message: error.message,
    };
  }
};

export default {
  generateQuizQuestions,
  testAIConnection,
};
