import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useTheme} from "../hooks/useTheme";
import {quizAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const TakeQuiz = () => {
  const {quizId} = useParams();
  const navigate = useNavigate();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuiz(quizId);
      setQuiz(response.data.quiz);
      setAnswers(new Array(response.data.quiz.questions.length).fill(null));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      setError("Please answer all questions before submitting");
      return;
    }
    try {
      setSubmitting(true);
      const response = await quizAPI.submitQuiz(quizId, answers);
      setResult({
        score: response.data.score,
        totalMarks: response.data.totalMarks,
        percentage: response.data.percentage,
        attemptId: response.data.attemptId,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading quiz..." />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div
        className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert type="error" message={error} />
          <button
            onClick={() => navigate(-1)}
            className={`mt-4 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isDark
                ? "bg-secondary text-secondary-foreground hover:bg-accent"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Results View
  if (result) {
    return (
      <div
        className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className={`rounded-xl border p-8 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <h1
              className={`text-2xl font-semibold mb-6 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Quiz Results
            </h1>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div
                className={`rounded-lg p-6 text-center ${
                  isDark ? "bg-secondary" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-sm mb-2 ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  Score
                </p>
                <p
                  className={`text-3xl font-bold ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  {result.score}/{result.totalMarks}
                </p>
              </div>
              <div className="rounded-lg p-6 text-center bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <p className="text-sm mb-2 opacity-90">Percentage</p>
                <p className="text-3xl font-bold">{result.percentage}%</p>
              </div>
              <div
                className={`rounded-lg p-6 text-center ${
                  isDark ? "bg-secondary" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-sm mb-2 ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  Status
                </p>
                <p
                  className={`text-xl font-bold ${
                    result.percentage >= 60 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.percentage >= 60 ? "Passed" : "Failed"}
                </p>
              </div>
            </div>

            <div
              className={`rounded-lg p-8 mb-6 text-center ${
                isDark
                  ? "bg-gradient-to-br from-blue-950 to-purple-950"
                  : "bg-gradient-to-br from-blue-50 to-purple-50"
              }`}
            >
              <div className="text-6xl mb-4">
                {result.percentage >= 90
                  ? "🏆"
                  : result.percentage >= 60
                  ? "🎉"
                  : "📚"}
              </div>
              <p
                className={`text-lg ${
                  isDark ? "text-foreground" : "text-gray-700"
                }`}
              >
                {result.percentage >= 90
                  ? "Excellent work! You aced this quiz!"
                  : result.percentage >= 60
                  ? "Good job! You passed the quiz."
                  : "Keep practicing! Review the material and try again."}
              </p>
            </div>

            <button
              onClick={() => navigate("/quizzes")}
              className={`w-full py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                isDark
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`rounded-xl border p-6 ${
            isDark ? "bg-card border-border" : "bg-white border-gray-200"
          }`}
        >
          {/* Quiz Header */}
          <div className="mb-6">
            <h1
              className={`text-2xl font-semibold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              {quiz.topic}
            </h1>
            <p
              className={`mt-1 ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              {quiz.chapter}
            </p>
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-muted-foreground" : "text-gray-400"
              }`}
            >
              {quiz.numberOfQuestions} Questions
            </p>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {/* Questions */}
          <div className="space-y-6 mb-6">
            {quiz.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className={`rounded-lg p-5 border ${
                  isDark
                    ? "bg-secondary border-border"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p
                  className={`font-medium mb-4 ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  {qIndex + 1}. {question.question}
                </p>

                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label
                      key={optIndex}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        answers[qIndex] === optIndex
                          ? "bg-blue-600 text-white"
                          : isDark
                          ? "bg-card border border-border hover:bg-accent"
                          : "bg-white border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={answers[qIndex] === optIndex}
                        onChange={() => handleAnswerSelect(qIndex, optIndex)}
                        className="mr-3"
                      />
                      <span
                        className={
                          answers[qIndex] === optIndex
                            ? "text-white"
                            : isDark
                            ? "text-foreground"
                            : "text-gray-700"
                        }
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className={`flex items-center justify-between pt-4 border-t ${
              isDark ? "border-border" : "border-gray-200"
            }`}
          >
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              Answered: {answers.filter((a) => a !== null).length} /{" "}
              {quiz.numberOfQuestions}
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting || answers.includes(null)}
              className="px-8 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Submitting...</span>
                </span>
              ) : (
                "Submit Quiz"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
