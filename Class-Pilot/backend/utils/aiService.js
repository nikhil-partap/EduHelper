// File: /backend/utils/aiService.js

import { VertexAI } from "@google-cloud/vertexai";
import OpenAI from "openai";

// Initialize AI clients lazily
let openaiClient = null;
let vertexAIClient = null;
let generativeModel = null;
let clientsInitialized = false;

// Vertex AI Configuration
const VERTEX_PROJECT = process.env.VERTEX_PROJECT || "plasma-kit-461015-e4";
const VERTEX_LOCATION = process.env.VERTEX_LOCATION || "us-central1";

/**
 * Initialize AI clients (called lazily on first use)
 */
function initializeClients() {
  if (clientsInitialized) return;

  // Initialize OpenAI (fallback)
  if (
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "your_openai_api_key_here"
  ) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Initialize Vertex AI
  try {
    vertexAIClient = new VertexAI({
      project: VERTEX_PROJECT,
      location: VERTEX_LOCATION,
    });

    // Create generative model with grounding
    generativeModel = vertexAIClient.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    console.log("✅ Vertex AI initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Vertex AI:", error.message);
  }

  clientsInitialized = true;
}

/**
 * Generate quiz questions using AI
 * @param {Object} params - Quiz generation parameters
 * @param {string} params.topic - Topic for the quiz
 * @param {string} params.chapter - Chapter name
 * @param {number} params.numberOfQuestions - Number of questions to generate
 * @param {string} params.difficultyLevel - Difficulty level (easy/medium/hard)
 * @param {string} params.provider - AI provider to use ("vertexai" or "openai")
 * @returns {Promise<Array>} Array of generated questions
 */
export const generateQuizQuestions = async ({
  topic,
  chapter,
  numberOfQuestions,
  difficultyLevel = "medium",
  provider = process.env.AI_PROVIDER || "vertexai",
}) => {
  try {
    // Initialize clients on first use
    initializeClients();

    // Validate provider
    if (!["openai", "vertexai", "gemini"].includes(provider)) {
      throw new Error(
        `Invalid AI provider: ${provider}. Use "vertexai" or "openai"`
      );
    }

    // Map gemini to vertexai for backward compatibility
    if (provider === "gemini") provider = "vertexai";

    // Check if provider is configured
    if (provider === "openai" && !openaiClient) {
      throw new Error("OpenAI API key not configured");
    }
    if (provider === "vertexai" && !generativeModel) {
      throw new Error(
        "Vertex AI not configured. Check your Google Cloud credentials."
      );
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
      questions = await generateWithVertexAI(prompt);
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
 * Generate questions using Vertex AI (Gemini)
 */
async function generateWithVertexAI(prompt) {
  try {
    const request = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const result = await generativeModel.generateContent(request);
    const response = result.response;

    // Extract text from response
    const content = response.candidates[0].content.parts[0].text.trim();

    return parseAIResponse(content);
  } catch (error) {
    console.error("Vertex AI Error:", error);
    if (error.message.includes("credentials")) {
      throw new Error(
        "Invalid Google Cloud credentials. Set GOOGLE_APPLICATION_CREDENTIALS env var."
      );
    }
    if (error.message.includes("quota")) {
      throw new Error("Vertex AI quota exceeded. Please try again later.");
    }
    throw new Error(`Vertex AI error: ${error.message}`);
  }
}

/**
 * Generate questions using OpenAI (fallback)
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
 * Generate study plan chapters using AI
 * @param {Object} params - Study plan generation parameters
 * @param {string} params.board - Education board (CBSE, ICSE, etc.)
 * @param {string} params.className - Class name (10th, 12th, etc.)
 * @param {string} params.subject - Subject (optional)
 * @param {string} params.provider - AI provider to use ("vertexai" or "openai")
 * @returns {Promise<Array>} Array of generated chapters
 */
export const generateStudyPlanChapters = async ({
  board,
  className,
  subject = "Mathematics",
  provider = process.env.AI_PROVIDER || "vertexai",
}) => {
  try {
    // Initialize clients on first use
    initializeClients();

    // Validate provider
    if (!["openai", "vertexai", "gemini"].includes(provider)) {
      throw new Error(
        `Invalid AI provider: ${provider}. Use "vertexai" or "openai"`
      );
    }

    // Map gemini to vertexai for backward compatibility
    if (provider === "gemini") provider = "vertexai";

    // Check if provider is configured
    if (provider === "openai" && !openaiClient) {
      throw new Error("OpenAI API key not configured");
    }
    if (provider === "vertexai" && !generativeModel) {
      throw new Error(
        "Vertex AI not configured. Check your Google Cloud credentials."
      );
    }

    // Create the prompt
    const prompt = createStudyPlanPrompt(board, className, subject);

    // Generate chapters based on provider
    let chapters;
    if (provider === "openai") {
      chapters = await generateStudyPlanWithOpenAI(prompt);
    } else {
      chapters = await generateStudyPlanWithVertexAI(prompt);
    }

    // Validate and format chapters
    return validateAndFormatChapters(chapters);
  } catch (error) {
    console.error("AI Study Plan Generation Error:", error);
    throw new Error(`Failed to generate study plan: ${error.message}`);
  }
};

/**
 * Create a structured prompt for study plan generation
 */
function createStudyPlanPrompt(board, className, subject) {
  return `Generate a comprehensive study plan for ${board} ${className} ${subject}.

Requirements:
- List all chapters/topics that need to be covered
- Estimate duration in days for each chapter (1-5 days based on complexity)
- Order chapters logically for learning progression
- Consider typical academic year timeline

Return ONLY a valid JSON array with this exact structure:
[
  {
    "chapterName": "Chapter name here",
    "durationDays": 3
  }
]

Important: Return ONLY the JSON array, no additional text or explanation.`;
}

/**
 * Generate study plan using Vertex AI
 */
async function generateStudyPlanWithVertexAI(prompt) {
  try {
    const request = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const result = await generativeModel.generateContent(request);
    const response = result.response;
    const content = response.candidates[0].content.parts[0].text.trim();

    return parseStudyPlanResponse(content);
  } catch (error) {
    console.error("Vertex AI Study Plan Error:", error);
    if (error.message.includes("credentials")) {
      throw new Error("Invalid Google Cloud credentials");
    }
    if (error.message.includes("quota")) {
      throw new Error("Vertex AI quota exceeded. Please try again later.");
    }
    throw new Error(`Vertex AI error: ${error.message}`);
  }
}

/**
 * Generate study plan using OpenAI
 */
async function generateStudyPlanWithOpenAI(prompt) {
  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educational curriculum planner. Generate study plans in valid JSON format only.",
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
    return parseStudyPlanResponse(content);
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
 * Parse AI response for study plan and extract JSON
 */
function parseStudyPlanResponse(content) {
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
    console.error("Failed to parse AI study plan response:", content);
    throw new Error("AI returned invalid JSON format");
  }
}

/**
 * Validate and format chapters
 */
function validateAndFormatChapters(chapters) {
  if (!Array.isArray(chapters)) {
    throw new Error("AI response is not an array");
  }

  if (chapters.length === 0) {
    throw new Error("AI generated no chapters");
  }

  // Validate each chapter
  const validChapters = chapters.map((ch, index) => {
    // Validate structure
    if (!ch.chapterName || ch.durationDays === undefined) {
      throw new Error(`Invalid chapter structure at index ${index}`);
    }

    // Ensure durationDays is a valid number
    const duration = parseInt(ch.durationDays, 10);
    if (isNaN(duration) || duration < 1) {
      throw new Error(`Chapter ${index + 1} has invalid durationDays`);
    }

    return {
      chapterName: ch.chapterName.trim(),
      durationDays: Math.min(Math.max(duration, 1), 10), // Clamp between 1-10 days
    };
  });

  return validChapters;
}

/**
 * Test AI connection
 */
export const testAIConnection = async (provider = "vertexai") => {
  try {
    // Initialize clients on first use
    initializeClients();

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
  generateStudyPlanChapters,
  testAIConnection,
};
