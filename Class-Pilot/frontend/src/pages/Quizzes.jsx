import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useClass} from "../hooks/useClass";
import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {quizAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const Quizzes = () => {
  const {user} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const {classes, fetchClasses} = useClass();
  const [selectedClass, setSelectedClass] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isTeacher = user?.role === "teacher";

  useEffect(() => {
    if (classes.length === 0) {
      fetchClasses();
    }
  }, [classes.length]);

  const handleClassSelect = async (classId) => {
    if (!classId) {
      setSelectedClass(null);
      setQuizzes([]);
      return;
    }
    const selected = classes.find((c) => c._id === classId);
    setSelectedClass(selected);
    await fetchQuizzes(classId);
  };

  const fetchQuizzes = async (classId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await quizAPI.getClassQuizzes(classId);
      setQuizzes(response.data.quizzes || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className={`text-2xl font-semibold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Quizzes
            </h1>
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              {isTeacher
                ? "View and manage quizzes for your classes"
                : "Take quizzes assigned to your classes"}
            </p>
          </div>
          {isTeacher && (
            <Link
              to="/quiz/generate"
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isDark
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              <span>✨</span>
              Generate New Quiz
            </Link>
          )}
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* Class Selection */}
        <div
          className={`rounded-xl border p-6 mb-6 ${
            isDark ? "bg-card border-border" : "bg-white border-gray-200"
          }`}
        >
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? "text-foreground" : "text-gray-700"
            }`}
          >
            Select Class
          </label>
          <select
            value={selectedClass?._id || ""}
            onChange={(e) => handleClassSelect(e.target.value)}
            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? "bg-input-background border-border text-foreground"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">Choose a class...</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className} - {cls.subject}
              </option>
            ))}
          </select>
        </div>

        {/* Quizzes List */}
        {selectedClass && (
          <>
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading quizzes..." />
              </div>
            ) : quizzes.length === 0 ? (
              <div
                className={`rounded-xl border p-12 text-center ${
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                }`}
              >
                <div className="text-6xl mb-4">📝</div>
                <h3
                  className={`text-lg font-medium mb-2 ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  No Quizzes Yet
                </h3>
                <p
                  className={`mb-6 ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  {isTeacher
                    ? "Generate your first quiz using AI"
                    : "No quizzes have been created for this class yet"}
                </p>
                {isTeacher && (
                  <Link
                    to="/quiz/generate"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Generate Quiz
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className={`rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-lg ${
                      isDark
                        ? "bg-card border-border hover:border-ring"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600" />
                    <div className="p-6">
                      <h3
                        className={`font-semibold mb-1 ${
                          isDark ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        {quiz.topic}
                      </h3>
                      <p
                        className={`text-sm mb-4 ${
                          isDark ? "text-muted-foreground" : "text-gray-500"
                        }`}
                      >
                        {quiz.chapter}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className={
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }
                          >
                            Questions
                          </span>
                          <span
                            className={`font-medium ${
                              isDark ? "text-foreground" : "text-gray-900"
                            }`}
                          >
                            {quiz.numberOfQuestions}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className={
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }
                          >
                            Generated by
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-md ${
                              quiz.generatedBy === "manual"
                                ? isDark
                                  ? "bg-secondary text-secondary-foreground"
                                  : "bg-gray-100 text-gray-700"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {quiz.generatedBy === "manual" ? "Manual" : "AI"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className={
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }
                          >
                            Created
                          </span>
                          <span
                            className={
                              isDark ? "text-foreground" : "text-gray-700"
                            }
                          >
                            {new Date(quiz.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {isTeacher ? (
                        <div className="flex gap-2">
                          <Link
                            to={`/quiz/${quiz._id}/stats`}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium text-center border transition-colors ${
                              isDark
                                ? "border-border text-foreground hover:bg-accent"
                                : "border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            View Stats
                          </Link>
                          <Link
                            to={`/quiz/${quiz._id}`}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium text-center transition-colors ${
                              isDark
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-gray-900 text-white hover:bg-gray-800"
                            }`}
                          >
                            Preview
                          </Link>
                        </div>
                      ) : (
                        <Link
                          to={`/quiz/${quiz._id}/take`}
                          className="block w-full py-2 px-4 bg-green-600 text-white rounded-md text-sm font-medium text-center hover:bg-green-700 transition-colors"
                        >
                          Take Quiz
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!selectedClass && (
          <div
            className={`rounded-xl border p-12 text-center ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <div className="text-6xl mb-4">📚</div>
            <h3
              className={`text-lg font-medium mb-2 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Select a Class
            </h3>
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              Choose a class from the dropdown above to view quizzes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
