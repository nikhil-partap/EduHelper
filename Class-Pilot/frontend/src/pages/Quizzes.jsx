import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useClass} from "../hooks/useClass";
import {useAuth} from "../hooks/useAuth";
import {quizAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const Quizzes = () => {
  const {user} = useAuth();
  const {classes, fetchClasses} = useClass();
  const [selectedClass, setSelectedClass] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (classes.length === 0) {
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isTeacher = user?.role === "teacher";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Quizzes</h1>
          <p className="mt-2 text-gray-400">
            {isTeacher
              ? "View and manage quizzes for your classes"
              : "Take quizzes assigned to your classes"}
          </p>
        </div>
        {isTeacher && (
          <Link
            to="/quiz/generate"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Generate New Quiz
          </Link>
        )}
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Class Selection */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Select Class
        </label>
        <select
          value={selectedClass?._id || ""}
          onChange={(e) => handleClassSelect(e.target.value)}
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

      {/* Quizzes List */}
      {selectedClass && (
        <>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading quizzes..." />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No Quizzes Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  {isTeacher
                    ? "Generate your first quiz using AI"
                    : "No quizzes have been created for this class yet"}
                </p>
                {isTeacher && (
                  <Link
                    to="/quiz/generate"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
                  >
                    Generate Quiz
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {quiz.topic}
                    </h3>
                    <p className="text-sm text-gray-400">{quiz.chapter}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Questions:</span>
                      <span className="text-white font-medium">
                        {quiz.numberOfQuestions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Generated by:</span>
                      <span className="text-blue-400 font-medium">
                        {quiz.generatedBy === "manual" ? "Manual" : "AI"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-gray-300">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isTeacher ? (
                    <div className="flex gap-2">
                      <Link
                        to={`/quiz/${quiz._id}/stats`}
                        className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded text-sm font-medium text-center"
                      >
                        View Stats
                      </Link>
                      <Link
                        to={`/quiz/${quiz._id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium text-center"
                      >
                        Preview
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={`/quiz/${quiz._id}/take`}
                      className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium text-center"
                    >
                      Take Quiz
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedClass && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-white mb-2">
              Select a Class
            </h3>
            <p className="text-gray-400">
              Choose a class from the dropdown above to view quizzes
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
