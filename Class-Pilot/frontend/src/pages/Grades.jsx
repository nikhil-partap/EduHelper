import {useState, useEffect} from "react";
import {useClass} from "../hooks/useClass";
import {useAuth} from "../hooks/useAuth";
import {quizAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const Grades = () => {
  const {user} = useAuth();
  const {classes, fetchClasses} = useClass();
  const [selectedClass, setSelectedClass] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (classes.length === 0) {
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes.length]);

  const fetchGrades = async (classId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await quizAPI.getStudentAttempts(classId, user.id);
      setAttempts(response.data.attempts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch grades");
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = async (classId) => {
    const selected = classes.find((c) => c._id === classId);
    setSelectedClass(selected);
    if (classId) {
      await fetchGrades(classId);
    } else {
      setAttempts([]);
    }
  };

  const calculateOverallGrade = () => {
    if (attempts.length === 0) return null;
    const total = attempts.reduce((sum, a) => sum + a.percentage, 0);
    return (total / attempts.length).toFixed(1);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-green-400";
    if (percentage >= 75) return "text-blue-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 85) return "A";
    if (percentage >= 80) return "B+";
    if (percentage >= 75) return "B";
    if (percentage >= 70) return "C+";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const overallGrade = calculateOverallGrade();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Grades</h1>
        <p className="mt-2 text-gray-400">
          View your quiz scores and academic performance
        </p>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading grades..." />
        </div>
      ) : selectedClass && attempts.length > 0 ? (
        <>
          {/* Overall Performance */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Overall Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Average Score</p>
                <p
                  className={`text-4xl font-bold ${getGradeColor(
                    overallGrade
                  )}`}
                >
                  {overallGrade}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Grade</p>
                <p
                  className={`text-4xl font-bold ${getGradeColor(
                    overallGrade
                  )}`}
                >
                  {getGradeLetter(overallGrade)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Quizzes Taken</p>
                <p className="text-4xl font-bold text-white">
                  {attempts.length}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Quiz Scores */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Quiz Scores
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Time Taken
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                  {attempts
                    .sort(
                      (a, b) =>
                        new Date(b.attemptedAt) - new Date(a.attemptedAt)
                    )
                    .map((attempt, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {new Date(attempt.attemptedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {attempt.score}/{attempt.totalMarks}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-semibold ${getGradeColor(
                              attempt.percentage
                            )}`}
                          >
                            {attempt.percentage}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              attempt.percentage >= 90
                                ? "bg-green-100 text-green-800"
                                : attempt.percentage >= 75
                                ? "bg-blue-100 text-blue-800"
                                : attempt.percentage >= 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {getGradeLetter(attempt.percentage)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {attempt.timeTaken
                              ? `${Math.floor(attempt.timeTaken / 60)}m ${
                                  attempt.timeTaken % 60
                                }s`
                              : "N/A"}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : selectedClass && !loading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Grades Yet
            </h3>
            <p className="text-gray-400">
              You haven't taken any quizzes in this class yet.
            </p>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-white mb-2">
                Select a Class
              </h3>
              <p className="text-gray-400">
                Choose a class from the dropdown above to view your grades
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Grades;
