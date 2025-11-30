import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {quizAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const TakeQuiz = () => {
  const {quizId} = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuiz(quizId);
      setQuiz(response.data.quiz);
      // Initialize answers array
      setAnswers(new Array(response.data.quiz.questions.length).fill(null));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.includes(null)) {
      setError("Please answer all questions before submitting");
      return;
    }

    try {
      setSubmitting(true);
      const response = await quizAPI.submitQuiz(quizId, answers);
      setResult(response.data.result);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" message={error} />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Show results after submission
  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-white mb-4">Quiz Results</h1>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Score</p>
              <p className="text-3xl font-bold text-white">
                {result.score}/{result.totalQuestions}
              </p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Percentage</p>
              <p className="text-3xl font-bold text-green-400">
                {result.percentage}%
              </p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Status</p>
              <p
                className={`text-xl font-bold ${
                  result.percentage >= 60 ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.percentage >= 60 ? "Passed" : "Failed"}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {quiz.questions.map((q, index) => {
              const userAnswer = result.answers[index];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div
                  key={index}
                  className={`bg-zinc-800 rounded-lg p-4 border ${
                    isCorrect ? "border-green-700" : "border-red-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-white">
                      {index + 1}. {q.question}
                    </p>
                    {isCorrect ? (
                      <span className="text-green-400 font-bold">✓</span>
                    ) : (
                      <span className="text-red-400 font-bold">✗</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => {
                      const isUserAnswer = optIndex === userAnswer;
                      const isCorrectAnswer = optIndex === q.correctAnswer;

                      return (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            isCorrectAnswer
                              ? "bg-green-900 border border-green-700"
                              : isUserAnswer
                              ? "bg-red-900 border border-red-700"
                              : "bg-zinc-700"
                          }`}
                        >
                          <span className="text-gray-200">
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {isCorrectAnswer && (
                              <span className="ml-2 text-green-400 font-medium">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span className="ml-2 text-red-400 font-medium">
                                Your Answer
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate("/quizzes")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Quiz taking interface
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{quiz.topic}</h1>
          <p className="text-gray-400 mt-2">{quiz.chapter}</p>
          <p className="text-sm text-gray-500 mt-1">
            {quiz.numberOfQuestions} Questions
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}

        <div className="space-y-6 mb-6">
          {quiz.questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
            >
              <p className="font-medium text-white mb-4">
                {qIndex + 1}. {question.question}
              </p>

              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                      answers[qIndex] === optIndex
                        ? "bg-blue-900 border border-blue-700"
                        : "bg-zinc-700 hover:bg-zinc-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={answers[qIndex] === optIndex}
                      onChange={() => handleAnswerSelect(qIndex, optIndex)}
                      className="mr-3"
                    />
                    <span className="text-gray-200">
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-400">
            Answered: {answers.filter((a) => a !== null).length} /{" "}
            {quiz.numberOfQuestions}
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting || answers.includes(null)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default TakeQuiz;
