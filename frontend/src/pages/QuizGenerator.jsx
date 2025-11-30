import {useState, useEffect} from "react";
import {useClass} from "../hooks/useClass";
import {useAuth} from "../hooks/useAuth";
import {quizAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const QuizGenerator = () => {
  const {user} = useAuth();
  const {classes, fetchClasses} = useClass();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const [formData, setFormData] = useState({
    classId: "",
    topic: "",
    chapter: "",
    numberOfQuestions: 5,
    difficultyLevel: "medium",
  });

  useEffect(() => {
    if (classes.length === 0) {
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes.length]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await quizAPI.generateQuiz(formData);
      setGeneratedQuiz(response.data.quiz);
      setSuccess("Quiz generated successfully!");

      // Reset form
      setFormData({
        classId: "",
        topic: "",
        chapter: "",
        numberOfQuestions: 5,
        difficultyLevel: "medium",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "teacher") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          type="info"
          message="Quiz generation is available for teachers only."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">AI Quiz Generator</h1>
        <p className="mt-2 text-gray-400">
          Generate quizzes automatically using AI
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Quiz Generation Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Generate New Quiz
        </h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Select Class *
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a class...</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className} - {cls.subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Topic *
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., Algebra"
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Chapter */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Chapter *
              </label>
              <input
                type="text"
                name="chapter"
                value={formData.chapter}
                onChange={handleChange}
                placeholder="e.g., Linear Equations"
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Number of Questions *
              </label>
              <input
                type="number"
                name="numberOfQuestions"
                value={formData.numberOfQuestions}
                onChange={handleChange}
                min="1"
                max="20"
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Difficulty Level */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Difficulty Level
              </label>
              <select
                name="difficultyLevel"
                value={formData.difficultyLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Generating Quiz...</span>
              </span>
            ) : (
              "Generate Quiz with AI"
            )}
          </button>
        </form>
      </div>

      {/* Generated Quiz Preview */}
      {generatedQuiz && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Generated Quiz Preview
          </h2>

          <div className="mb-4">
            <p className="text-gray-400">
              <span className="font-medium text-white">Topic:</span>{" "}
              {generatedQuiz.topic}
            </p>
            <p className="text-gray-400">
              <span className="font-medium text-white">Chapter:</span>{" "}
              {generatedQuiz.chapter}
            </p>
            <p className="text-gray-400">
              <span className="font-medium text-white">Questions:</span>{" "}
              {generatedQuiz.numberOfQuestions}
            </p>
          </div>

          <div className="space-y-6">
            {generatedQuiz.questions.map((q, index) => (
              <div
                key={index}
                className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
              >
                <p className="font-medium text-white mb-3">
                  {index + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-2 rounded ${
                        optIndex === q.correctAnswer
                          ? "bg-green-900 border border-green-700"
                          : "bg-zinc-700"
                      }`}
                    >
                      <span className="text-gray-200">
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {optIndex === q.correctAnswer && (
                          <span className="ml-2 text-green-400 font-medium">
                            ✓ Correct
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Difficulty: {q.difficultyLevel}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
