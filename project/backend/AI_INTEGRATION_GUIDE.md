# AI Integration Guide for Quiz Generation

## 🚀 Quick Start

### Step 1: Get API Keys

#### Option A: Google Gemini (Recommended - Free Tier Available)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key"
4. Copy your API key

#### Option B: OpenAI

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy your API key (you won't see it again!)

### Step 2: Add API Key to .env

Open `backend/.env` and add your key:

```env
# For Gemini (Recommended)
GEMINI_API_KEY=your_actual_gemini_key_here
AI_PROVIDER=gemini

# OR for OpenAI
OPENAI_API_KEY=your_actual_openai_key_here
AI_PROVIDER=openai
```

### Step 3: Test the Connection

```bash
# Start your backend server
cd backend
npm run dev
```

Test endpoint:

```bash
# Test Gemini
curl -X POST http://localhost:5000/api/quiz/test-ai \
  -H "Content-Type: application/json" \
  -d '{"provider": "gemini"}'

# Test OpenAI
curl -X POST http://localhost:5000/api/quiz/test-ai \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai"}'
```

---

## 📚 Usage Examples

### Generate a Quiz (Frontend)

```javascript
import { quizAPI } from "../services/api";

const generateQuiz = async () => {
  try {
    const response = await quizAPI.generateQuiz({
      classId: "class_id_here",
      topic: "Algebra",
      chapter: "Linear Equations",
      numberOfQuestions: 5,
      difficultyLevel: "medium",
    });

    console.log("Quiz generated:", response.data);
  } catch (error) {
    console.error("Failed to generate quiz:", error);
  }
};
```

### Generate a Quiz (Backend Controller)

```javascript
import { generateQuizQuestions } from "../utils/aiService.js";

const questions = await generateQuizQuestions({
  topic: "Physics",
  chapter: "Newton's Laws",
  numberOfQuestions: 10,
  difficultyLevel: "hard",
  provider: "gemini", // or "openai"
});
```

---

## 🔧 Configuration

### Switch Between Providers

In `.env`:

```env
AI_PROVIDER=gemini  # or "openai"
```

Or specify in code:

```javascript
const questions = await generateQuizQuestions({
  topic: "Chemistry",
  chapter: "Periodic Table",
  numberOfQuestions: 5,
  provider: "openai", // Override default
});
```

---

## 💰 Cost Comparison

### Google Gemini

- **Free Tier**: 60 requests per minute
- **Cost**: Free for most educational use
- **Model**: gemini-pro
- **Best For**: Development and small-scale use

### OpenAI

- **Free Tier**: $5 credit for new accounts
- **Cost**: ~$0.002 per quiz (5 questions)
- **Model**: gpt-3.5-turbo
- **Best For**: Production with budget

---

## ⚠️ Error Handling

### Common Errors

1. **"API key not configured"**

   - Solution: Add your API key to `.env`

2. **"Rate limit exceeded"**

   - Solution: Wait a few minutes or upgrade your plan

3. **"Invalid JSON format"**

   - Solution: AI returned unexpected format (retry usually works)

4. **"Quota exceeded"**
   - Solution: Check your API usage limits

### Retry Logic

The system automatically handles:

- JSON parsing errors
- Malformed responses
- Validation issues

---

## 🎯 Best Practices

### 1. Use Appropriate Difficulty Levels

```javascript
// Easy: Basic concepts, simple questions
difficultyLevel: "easy";

// Medium: Standard questions, moderate complexity
difficultyLevel: "medium";

// Hard: Advanced concepts, complex scenarios
difficultyLevel: "hard";
```

### 2. Limit Questions Per Request

```javascript
// Good: 5-10 questions per request
numberOfQuestions: 5;

// Avoid: Too many questions (slower, more expensive)
numberOfQuestions: 50;
```

### 3. Cache Generated Quizzes

```javascript
// Store in database after generation
const quiz = await Quiz.create({
  classId,
  teacherId,
  topic,
  chapter,
  questions,
  generatedBy: "gemini",
});
```

---

## 🧪 Testing

### Test AI Service

```javascript
import { testAIConnection } from "./utils/aiService.js";

// Test Gemini
const geminiTest = await testAIConnection("gemini");
console.log(geminiTest);

// Test OpenAI
const openaiTest = await testAIConnection("openai");
console.log(openaiTest);
```

### Expected Response

```json
{
  "success": true,
  "provider": "gemini",
  "message": "gemini connection successful",
  "sampleQuestion": {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1,
    "difficultyLevel": "easy"
  }
}
```

---

## 🔒 Security

### Environment Variables

- ✅ Never commit `.env` to git
- ✅ Use different keys for dev/production
- ✅ Rotate keys regularly

### Rate Limiting

```javascript
// Add rate limiting to quiz generation
import rateLimit from "express-rate-limit";

const quizGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: "Too many quiz generation requests",
});

router.post("/generate", protect, quizGenerationLimiter, generateQuiz);
```

---

## 📊 Monitoring

### Log AI Usage

```javascript
// In aiService.js
console.log(`AI Request: ${provider} - ${topic} - ${numberOfQuestions}Q`);
console.log(`AI Response: ${questions.length} questions generated`);
```

### Track Costs

```javascript
// Estimate costs
const estimatedCost = {
  openai: numberOfQuestions * 0.0004, // ~$0.0004 per question
  gemini: 0, // Free tier
};
```

---

## 🚨 Troubleshooting

### Issue: "AI returned invalid JSON format"

**Solution:**

1. Check AI response in logs
2. Verify prompt format
3. Try different provider
4. Retry the request

### Issue: "Rate limit exceeded"

**Solution:**

1. Wait 1 minute
2. Reduce numberOfQuestions
3. Upgrade API plan
4. Switch to different provider

### Issue: "Questions don't match topic"

**Solution:**

1. Make topic more specific
2. Add more context to chapter
3. Adjust difficulty level
4. Regenerate quiz

---

## 📝 Example Quiz Generation Flow

```javascript
// 1. Teacher creates quiz request
POST /api/quiz/generate
{
  "classId": "class123",
  "topic": "World War II",
  "chapter": "Chapter 5: The Pacific Theater",
  "numberOfQuestions": 5,
  "difficultyLevel": "medium"
}

// 2. Backend calls AI service
const questions = await generateQuizQuestions({...});

// 3. Validate and save to database
const quiz = await Quiz.create({
  classId,
  teacherId: req.user._id,
  topic,
  chapter,
  numberOfQuestions: questions.length,
  questions,
  generatedBy: "gemini"
});

// 4. Return quiz to frontend
res.status(201).json({
  success: true,
  quiz
});
```

---

## 🎓 Next Steps

1. ✅ Get API key (Gemini or OpenAI)
2. ✅ Add to `.env` file
3. ✅ Test connection
4. ✅ Generate your first quiz
5. ✅ Integrate with frontend

**Ready to generate quizzes with AI!** 🚀
