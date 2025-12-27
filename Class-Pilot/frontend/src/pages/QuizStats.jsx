import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useTheme} from "../hooks/useTheme";
import {quizAPI, exportAPI, downloadFile} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const QuizStats = () => {
  const {quizId} = useParams();
  const navigate = useNavigate();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const [quiz, setQuiz] = useState(null);
  const [stats, setStats] = useState([]);
  const [classAverage, setClassAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizRes, statsRes] = await Promise.all([
        quizAPI.getQuiz(quizId),
        quizAPI.getQuizStats(quizId),
      ]);
      setQuiz(quizRes.data.quiz);
      setStats(statsRes.data.stats || []);
      setClassAverage(statsRes.data.classAverage || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quiz stats");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeBg = (percentage) => {
    if (percentage >= 90) return isDark ? "bg-green-950/50" : "bg-green-50";
    if (percentage >= 75) return isDark ? "bg-blue-950/50" : "bg-blue-50";
    if (percentage >= 60) return isDark ? "bg-yellow-950/50" : "bg-yellow-50";
    return isDark ? "bg-red-950/50" : "bg-red-50";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading stats..." />
      </div>
    );
  }

  if (error) {
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

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`mb-4 flex items-center gap-2 text-sm ${
              isDark
                ? "text-muted-foreground hover:text-foreground"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ← Back to Quizzes
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1
                className={`text-2xl font-semibold ${
                  isDark ? "text-foreground" : "text-gray-900"
                }`}
              >
                {quiz?.topic}
              </h1>
              <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
                {quiz?.chapter}
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  const response = await exportAPI.downloadQuizResults(
                    quizId,
                    "excel"
                  );
                  downloadFile(
                    response.data,
                    `quiz_results_${quiz?.topic || quizId}.xlsx`
                  );
                  setSuccess("Quiz results downloaded!");
                  setTimeout(() => setSuccess(null), 2000);
                } catch (err) {
                  setError(
                    err.response?.data?.error || "Failed to export quiz results"
                  );
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              📥 Export Results
            </button>
          </div>
          {success && (
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess(null)}
              className="mt-4"
            />
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className={`rounded-xl border p-4 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              Total Questions
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              {quiz?.numberOfQuestions || 0}
            </p>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              Attempts
            </p>
            <p
              className={`text-2xl font-bold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              {stats.length}
            </p>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              Class Average
            </p>
            <p className={`text-2xl font-bold ${getGradeColor(classAverage)}`}>
              {classAverage}%
            </p>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              Pass Rate
            </p>
            <p className="text-2xl font-bold text-green-600">
              {stats.length > 0
                ? Math.round(
                    (stats.filter((s) => s.percentage >= 60).length /
                      stats.length) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Student Results Table */}
        <div
          className={`rounded-xl border overflow-hidden ${
            isDark ? "bg-card border-border" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`px-6 py-4 border-b ${
              isDark ? "border-border" : "border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Student Results
            </h2>
          </div>

          {stats.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📊</div>
              <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
                No students have attempted this quiz yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className={isDark ? "bg-secondary" : "bg-gray-50"}>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Rank
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Student
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Roll No
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Score
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Percentage
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Attempted At
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? "divide-border" : "divide-gray-200"
                  }`}
                >
                  {stats
                    .sort((a, b) => b.percentage - a.percentage)
                    .map((student, index) => (
                      <tr
                        key={student.studentId}
                        className={`${getGradeBg(student.percentage)} ${
                          isDark ? "hover:bg-accent" : "hover:bg-gray-100"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`font-medium ${
                              isDark ? "text-foreground" : "text-gray-900"
                            }`}
                          >
                            {index === 0 && "🥇"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
                            {index > 2 && `#${index + 1}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              isDark ? "text-foreground" : "text-gray-900"
                            }
                          >
                            {student.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }
                          >
                            {student.rollNumber || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              isDark ? "text-foreground" : "text-gray-900"
                            }
                          >
                            {student.score}/{quiz?.numberOfQuestions}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`font-semibold ${getGradeColor(
                              student.percentage
                            )}`}
                          >
                            {student.percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }
                          >
                            {new Date(student.attemptedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizStats;
