import {useState, useEffect} from "react";
import {useClass} from "../hooks/useClass";
import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {quizAPI, gradeAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const Grades = () => {
  const {user} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const isTeacher = user?.role === "teacher";
  const {classes, fetchClasses} = useClass();
  const [selectedClass, setSelectedClass] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [manualGrades, setManualGrades] = useState([]);
  const [gradeSummary, setGradeSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("quizzes");

  useEffect(() => {
    if (classes.length === 0) {
      fetchClasses();
    }
  }, [classes.length]);

  const fetchGrades = async (classId) => {
    try {
      setLoading(true);
      setError(null);
      if (isTeacher) {
        const response = await gradeAPI.getClassGrades(classId);
        setManualGrades(response.data.gradesByStudent || []);
      } else {
        const [attemptsRes, gradesRes] = await Promise.all([
          quizAPI.getStudentAttempts(classId, user.id),
          gradeAPI.getStudentGrades(classId, user.id),
        ]);
        setAttempts(attemptsRes.data.attempts || []);
        setManualGrades(gradesRes.data.grades || []);
        setGradeSummary(gradesRes.data.summary || null);
      }
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
      setManualGrades([]);
      setGradeSummary(null);
    }
  };

  const calculateOverallGrade = () => {
    if (attempts.length === 0) return null;
    const total = attempts.reduce((sum, a) => sum + a.percentage, 0);
    return (total / attempts.length).toFixed(1);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
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
  const hasQuizGrades = attempts.length > 0;
  const hasManualGrades = manualGrades.length > 0;

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className={`text-2xl font-semibold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              {isTeacher ? "Grade Book" : "My Grades"}
            </h1>
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              {isTeacher
                ? "Manage student grades"
                : "View your grades across all classes"}
            </p>
          </div>
          {isTeacher && (
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                isDark
                  ? "border-border text-foreground hover:bg-accent"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>📥</span>Export Grades
            </button>
          )}
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

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

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading grades..." />
          </div>
        ) : selectedClass && (hasQuizGrades || hasManualGrades) ? (
          <>
            {!isTeacher && hasQuizGrades && (
              <div
                className={`rounded-xl border p-6 mb-6 ${
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                }`}
              >
                <h2
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  Overall Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                    <p className="text-sm opacity-90 mb-2">Average Score</p>
                    <p className="text-4xl font-bold">{overallGrade}%</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white">
                    <p className="text-sm opacity-90 mb-2">Grade</p>
                    <p className="text-4xl font-bold">
                      {getGradeLetter(overallGrade)}
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg text-white">
                    <p className="text-sm opacity-90 mb-2">Quizzes Taken</p>
                    <p className="text-4xl font-bold">{attempts.length}</p>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`rounded-xl border overflow-hidden ${
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`border-b ${
                  isDark ? "border-border" : "border-gray-200"
                }`}
              >
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "quizzes"
                        ? "border-blue-500 text-blue-600"
                        : isDark
                        ? "border-transparent text-muted-foreground hover:text-foreground"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Quiz Scores ({attempts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("manual")}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "manual"
                        ? "border-blue-500 text-blue-600"
                        : isDark
                        ? "border-transparent text-muted-foreground hover:text-foreground"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Manual Grades ({manualGrades.length})
                  </button>
                </nav>
              </div>
              <div className="p-6">
                {activeTab === "quizzes" && hasQuizGrades && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className={isDark ? "bg-secondary" : "bg-gray-50"}>
                          <th
                            className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }`}
                          >
                            Date
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
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={`divide-y ${
                          isDark ? "divide-border" : "divide-gray-200"
                        }`}
                      >
                        {attempts
                          .sort(
                            (a, b) =>
                              new Date(b.attemptedAt) - new Date(a.attemptedAt)
                          )
                          .map((attempt, index) => (
                            <tr
                              key={index}
                              className={
                                isDark ? "hover:bg-accent" : "hover:bg-gray-50"
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`text-sm ${
                                    isDark ? "text-foreground" : "text-gray-900"
                                  }`}
                                >
                                  {new Date(
                                    attempt.attemptedAt
                                  ).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`text-sm ${
                                    isDark ? "text-foreground" : "text-gray-900"
                                  }`}
                                >
                                  {attempt.score}/{attempt.totalMarks}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`text-sm font-semibold ${getGradeColor(
                                    attempt.percentage
                                  )}`}
                                >
                                  {attempt.percentage}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
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
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {activeTab === "quizzes" && !hasQuizGrades && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📝</div>
                    <p
                      className={
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }
                    >
                      No quiz scores yet
                    </p>
                  </div>
                )}
                {activeTab === "manual" && hasManualGrades && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className={isDark ? "bg-secondary" : "bg-gray-50"}>
                          <th
                            className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }`}
                          >
                            Title
                          </th>
                          <th
                            className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }`}
                          >
                            Type
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
                        </tr>
                      </thead>
                      <tbody
                        className={`divide-y ${
                          isDark ? "divide-border" : "divide-gray-200"
                        }`}
                      >
                        {manualGrades.map((grade, index) => {
                          const percentage =
                            (grade.score / grade.maxScore) * 100;
                          return (
                            <tr
                              key={index}
                              className={
                                isDark ? "hover:bg-accent" : "hover:bg-gray-50"
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`text-sm font-medium ${
                                    isDark ? "text-foreground" : "text-gray-900"
                                  }`}
                                >
                                  {grade.title}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs rounded-md capitalize ${
                                    isDark
                                      ? "bg-secondary text-secondary-foreground"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {grade.gradeType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`text-sm ${
                                    isDark ? "text-foreground" : "text-gray-900"
                                  }`}
                                >
                                  {grade.score}/{grade.maxScore}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`text-sm font-semibold ${getGradeColor(
                                    percentage
                                  )}`}
                                >
                                  {percentage.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {activeTab === "manual" && !hasManualGrades && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📊</div>
                    <p
                      className={
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }
                    >
                      No manual grades yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : selectedClass && !loading ? (
          <div
            className={`rounded-xl border p-6 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3
                className={`text-lg font-medium mb-2 ${
                  isDark ? "text-foreground" : "text-gray-900"
                }`}
              >
                No Grades Yet
              </h3>
              <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
                You haven't taken any quizzes in this class yet.
              </p>
            </div>
          </div>
        ) : (
          !loading && (
            <div
              className={`rounded-xl border p-6 ${
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              }`}
            >
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3
                  className={`text-lg font-medium mb-2 ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  Select a Class
                </h3>
                <p
                  className={isDark ? "text-muted-foreground" : "text-gray-500"}
                >
                  Choose a class from the dropdown above to view your grades
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Grades;
