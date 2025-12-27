import {useState, useEffect} from "react";
import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {LoadingSpinner, Alert} from "../components/shared";
import {portfolioAPI, classAPI} from "../services/api";

const Portfolio = () => {
  const {user} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student's classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await classAPI.getStudentClasses();
        setClasses(response.data.data || []);
        if (response.data.data?.length > 0) {
          setSelectedClassId(response.data.data[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch classes");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch portfolio when class is selected
  useEffect(() => {
    if (!selectedClassId || !user?._id) return;

    const fetchPortfolio = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await portfolioAPI.getStudentPortfolio(
          user._id,
          selectedClassId
        );
        setPortfolio(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch portfolio");
        setPortfolio(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolio();
  }, [selectedClassId, user?._id]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade) => {
    if (["A+", "A"].includes(grade)) return "from-green-500 to-emerald-500";
    if (["B+", "B"].includes(grade)) return "from-blue-500 to-cyan-500";
    if (["C+", "C"].includes(grade)) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  // Progress Bar Component
  const ProgressBar = ({value, className = ""}) => (
    <div
      className={`w-full h-2 rounded-full overflow-hidden ${
        isDark ? "bg-primary/20" : "bg-gray-200"
      } ${className}`}
    >
      <div
        className="h-full bg-primary transition-all duration-500"
        style={{width: `${Math.min(100, Math.max(0, value))}%`}}
      />
    </div>
  );

  // Stat Card for Portfolio
  const PortfolioStatCard = ({
    icon,
    iconColor,
    title,
    value,
    subtitle,
    progress,
  }) => (
    <div
      className={`rounded-xl border p-6 ${
        isDark ? "bg-card border-border" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={iconColor}>{icon}</span>
        <span
          className={`text-sm font-medium ${
            isDark ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          {title}
        </span>
      </div>
      <div
        className={`text-3xl font-bold mb-2 ${
          isDark ? "text-foreground" : "text-gray-900"
        }`}
      >
        {value}
      </div>
      {progress !== undefined && <ProgressBar value={progress} />}
      {subtitle && (
        <p
          className={`text-xs mt-2 ${
            isDark ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  // Insight Card
  const InsightCard = ({insight}) => (
    <div
      className={`flex gap-3 p-4 rounded-lg border transition-colors ${
        isDark
          ? "bg-card border-border hover:bg-accent"
          : "bg-white border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isDark ? "bg-primary/10" : "bg-blue-50"
        }`}
      >
        🎯
      </div>
      <p className={`text-sm ${isDark ? "text-foreground" : "text-gray-700"}`}>
        {insight}
      </p>
    </div>
  );

  if (isLoading && !portfolio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading portfolio..." />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-6 ${isDark ? "bg-background" : "bg-gray-50"}`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1
            className={`text-2xl font-semibold ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            My Portfolio
          </h1>
          <p
            className={`${isDark ? "text-muted-foreground" : "text-gray-500"}`}
          >
            Comprehensive view of your academic performance and progress
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* Class Selector */}
        <div
          className={`mb-6 p-4 rounded-xl border ${
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
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className={`w-full md:w-64 px-4 py-2 rounded-md border text-sm ${
              isDark
                ? "bg-input-background border-input text-foreground"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-ring`}
          >
            {classes.length === 0 ? (
              <option value="">No classes enrolled</option>
            ) : (
              classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} - {cls.subject}
                </option>
              ))
            )}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading analytics..." />
          </div>
        ) : portfolio ? (
          <div className="space-y-6">
            {/* Overall Performance Card */}
            <div
              className={`rounded-xl border overflow-hidden ${
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`h-1.5 bg-gradient-to-r ${getGradeColor(
                  portfolio.overallScore?.grade || "F"
                )}`}
              />
              <div className="p-6">
                <h2
                  className={`font-semibold mb-1 ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  Overall Performance
                </h2>
                <p
                  className={`text-sm mb-6 ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  Your current academic standing
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Grade Badge */}
                  <div
                    className={`flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white`}
                  >
                    <span className="text-3xl mb-2">🏆</span>
                    <div className="text-5xl font-bold mb-1">
                      {portfolio.overallScore?.grade || "F"}
                    </div>
                    <div className="text-sm opacity-90">
                      {portfolio.overallScore?.score || 0}%
                    </div>
                  </div>

                  <PortfolioStatCard
                    icon="📅"
                    iconColor="text-blue-600"
                    title="Attendance"
                    value={`${portfolio.attendance?.percentage || 0}%`}
                    progress={portfolio.attendance?.percentage || 0}
                    subtitle={`${portfolio.attendance?.presentDays || 0} of ${
                      portfolio.attendance?.totalDays || 0
                    } classes`}
                  />

                  <PortfolioStatCard
                    icon="📝"
                    iconColor="text-purple-600"
                    title="Quiz Average"
                    value={`${portfolio.quizzes?.averageScore || 0}%`}
                    progress={portfolio.quizzes?.averageScore || 0}
                    subtitle={`${
                      portfolio.quizzes?.totalAttempts || 0
                    } quizzes taken`}
                  />

                  <PortfolioStatCard
                    icon="📋"
                    iconColor="text-pink-600"
                    title="Assignments"
                    value={`${portfolio.assignments?.submissionRate || 0}%`}
                    progress={portfolio.assignments?.submissionRate || 0}
                    subtitle={`${portfolio.assignments?.submitted || 0} of ${
                      portfolio.assignments?.totalAssignments || 0
                    } submitted`}
                  />
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {portfolio.insights?.length > 0 && (
              <div
                className={`rounded-xl border p-6 ${
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-600">💡</span>
                  <h2
                    className={`font-semibold ${
                      isDark ? "text-foreground" : "text-gray-900"
                    }`}
                  >
                    AI-Powered Insights
                  </h2>
                </div>
                <p
                  className={`text-sm mb-4 ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  Personalized recommendations based on your performance
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.insights.map((insight, idx) => (
                    <InsightCard
                      key={idx}
                      insight={insight.message || insight}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Attendance Analysis */}
            <div
              className={`rounded-xl border p-6 ${
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`font-semibold mb-1 ${
                  isDark ? "text-foreground" : "text-gray-900"
                }`}
              >
                Attendance Analysis
              </h2>
              <p
                className={`text-sm mb-6 ${
                  isDark ? "text-muted-foreground" : "text-gray-500"
                }`}
              >
                Your attendance patterns and trends
              </p>

              {portfolio.attendance?.totalDays > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    className={`text-center p-4 rounded-lg ${
                      isDark ? "bg-green-950" : "bg-green-50"
                    }`}
                  >
                    <span className="text-2xl">✅</span>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                      {portfolio.attendance.presentDays}
                    </div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Present
                    </p>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg ${
                      isDark ? "bg-red-950" : "bg-red-50"
                    }`}
                  >
                    <span className="text-2xl">❌</span>
                    <div className="text-2xl font-bold text-red-600 mt-2">
                      {portfolio.attendance.absentDays}
                    </div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Absent
                    </p>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg ${
                      isDark ? "bg-yellow-950" : "bg-yellow-50"
                    }`}
                  >
                    <span className="text-2xl">⏰</span>
                    <div className="text-2xl font-bold text-yellow-600 mt-2">
                      {portfolio.attendance.lateDays}
                    </div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Late
                    </p>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg ${
                      isDark ? "bg-blue-950" : "bg-blue-50"
                    }`}
                  >
                    <span className="text-2xl">📅</span>
                    <div className="text-2xl font-bold text-blue-600 mt-2">
                      {portfolio.attendance.totalDays}
                    </div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Total
                    </p>
                  </div>
                </div>
              ) : (
                <p
                  className={isDark ? "text-muted-foreground" : "text-gray-500"}
                >
                  No attendance records yet.
                </p>
              )}
            </div>

            {/* Quiz Performance */}
            <div
              className={`rounded-xl border p-6 ${
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`font-semibold mb-1 ${
                  isDark ? "text-foreground" : "text-gray-900"
                }`}
              >
                Quiz Performance
              </h2>
              <p
                className={`text-sm mb-6 ${
                  isDark ? "text-muted-foreground" : "text-gray-500"
                }`}
              >
                Track your quiz scores and progress
              </p>

              {portfolio.quizzes?.totalAttempts > 0 ? (
                <div className="space-y-6">
                  {/* Quiz Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                      className={`p-4 rounded-lg text-center ${
                        isDark ? "bg-muted" : "bg-gray-100"
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold ${
                          isDark ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        {portfolio.quizzes.totalAttempts}
                      </div>
                      <p
                        className={`text-sm ${
                          isDark ? "text-muted-foreground" : "text-gray-500"
                        }`}
                      >
                        Quizzes Taken
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-lg text-center ${
                        isDark ? "bg-muted" : "bg-gray-100"
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold ${getScoreColor(
                          portfolio.quizzes.averageScore
                        )}`}
                      >
                        {portfolio.quizzes.averageScore}%
                      </div>
                      <p
                        className={`text-sm ${
                          isDark ? "text-muted-foreground" : "text-gray-500"
                        }`}
                      >
                        Average
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-lg text-center ${
                        isDark ? "bg-muted" : "bg-gray-100"
                      }`}
                    >
                      <div className="text-2xl font-bold text-green-600">
                        {portfolio.quizzes.highestScore}%
                      </div>
                      <p
                        className={`text-sm ${
                          isDark ? "text-muted-foreground" : "text-gray-500"
                        }`}
                      >
                        Highest
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-lg text-center ${
                        isDark ? "bg-muted" : "bg-gray-100"
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold ${
                          isDark ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        {portfolio.quizzes.trend === "improving"
                          ? "📈"
                          : portfolio.quizzes.trend === "declining"
                          ? "📉"
                          : "➡️"}
                      </div>
                      <p
                        className={`text-sm capitalize ${
                          isDark ? "text-muted-foreground" : "text-gray-500"
                        }`}
                      >
                        {portfolio.quizzes.trend}
                      </p>
                    </div>
                  </div>

                  {/* Topic Performance */}
                  {portfolio.quizzes.topicPerformance?.length > 0 && (
                    <div>
                      <h3
                        className={`text-sm font-medium mb-3 ${
                          isDark ? "text-muted-foreground" : "text-gray-600"
                        }`}
                      >
                        Performance by Topic
                      </h3>
                      <div className="space-y-3">
                        {portfolio.quizzes.topicPerformance.map(
                          (topic, idx) => (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`text-sm font-medium ${
                                    isDark ? "text-foreground" : "text-gray-900"
                                  }`}
                                >
                                  {topic.topic}
                                </span>
                                <span
                                  className={`text-sm font-bold ${getScoreColor(
                                    topic.averageScore
                                  )}`}
                                >
                                  {topic.averageScore}%
                                </span>
                              </div>
                              <ProgressBar value={topic.averageScore} />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent Scores */}
                  {portfolio.quizzes.scores?.length > 0 && (
                    <div>
                      <h3
                        className={`text-sm font-medium mb-3 ${
                          isDark ? "text-muted-foreground" : "text-gray-600"
                        }`}
                      >
                        Recent Quiz Scores
                      </h3>
                      <div className="space-y-2">
                        {portfolio.quizzes.scores
                          .slice(-5)
                          .reverse()
                          .map((score, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                isDark ? "border-border" : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                  {score.percentage}
                                </div>
                                <div>
                                  <p
                                    className={`font-medium ${
                                      isDark
                                        ? "text-foreground"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {score.topic}
                                  </p>
                                  <p
                                    className={`text-sm ${
                                      isDark
                                        ? "text-muted-foreground"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {new Date(score.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                                  score.percentage >= 85
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {score.score}/{score.totalMarks}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p
                  className={isDark ? "text-muted-foreground" : "text-gray-500"}
                >
                  No quiz attempts yet.
                </p>
              )}
            </div>

            {/* Two Column Layout for Assignments & Grades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assignment Submission */}
              <div
                className={`rounded-xl border p-6 ${
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                }`}
              >
                <h2
                  className={`font-semibold mb-1 ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  Assignment Submission
                </h2>
                <p
                  className={`text-sm mb-6 ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  Track your assignment completion
                </p>

                {portfolio.assignments?.totalAssignments > 0 ? (
                  <div className="space-y-6">
                    <div className="text-center p-6">
                      <div
                        className={`text-4xl font-bold mb-2 ${getScoreColor(
                          portfolio.assignments.submissionRate
                        )}`}
                      >
                        {portfolio.assignments.submissionRate}%
                      </div>
                      <ProgressBar
                        value={portfolio.assignments.submissionRate}
                        className="h-3 mb-2"
                      />
                      <p
                        className={`text-sm ${
                          isDark ? "text-muted-foreground" : "text-gray-500"
                        }`}
                      >
                        {portfolio.assignments.submitted} of{" "}
                        {portfolio.assignments.totalAssignments} assignments
                        submitted
                      </p>
                    </div>

                    {portfolio.assignments.assignments?.length > 0 && (
                      <div className="space-y-2">
                        {portfolio.assignments.assignments
                          .slice(0, 5)
                          .map((assignment, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                isDark ? "border-border" : "border-gray-200"
                              }`}
                            >
                              <div>
                                <p
                                  className={`font-medium text-sm ${
                                    isDark ? "text-foreground" : "text-gray-900"
                                  }`}
                                >
                                  {assignment.title}
                                </p>
                                <span
                                  className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-md ${
                                    assignment.status === "graded"
                                      ? "bg-green-100 text-green-800"
                                      : assignment.status === "submitted"
                                      ? "bg-blue-100 text-blue-800"
                                      : assignment.status === "overdue"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {assignment.status}
                                </span>
                              </div>
                              {assignment.grade && (
                                <div className="text-2xl font-bold">
                                  {assignment.grade}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p
                    className={
                      isDark ? "text-muted-foreground" : "text-gray-500"
                    }
                  >
                    No assignments yet.
                  </p>
                )}
              </div>

              {/* Grade Breakdown */}
              <div
                className={`rounded-xl border p-6 ${
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                }`}
              >
                <h2
                  className={`font-semibold mb-1 ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  Grade Breakdown
                </h2>
                <p
                  className={`text-sm mb-6 ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  Your grades by category
                </p>

                {portfolio.grades?.totalGrades > 0 ? (
                  <div className="space-y-6">
                    <div className="text-center p-6">
                      <div
                        className={`text-4xl font-bold mb-2 ${getScoreColor(
                          portfolio.grades.averagePercentage
                        )}`}
                      >
                        {portfolio.grades.averagePercentage}%
                      </div>
                      <p
                        className={`text-sm ${
                          isDark ? "text-muted-foreground" : "text-gray-500"
                        }`}
                      >
                        Overall Grade
                      </p>
                    </div>

                    {Object.keys(portfolio.grades.gradesByType || {}).length >
                      0 && (
                      <div className="space-y-2">
                        {Object.entries(portfolio.grades.gradesByType).map(
                          ([type, data], idx) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                isDark ? "border-border" : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: [
                                      "#3b82f6",
                                      "#8b5cf6",
                                      "#ec4899",
                                      "#f59e0b",
                                    ][idx % 4],
                                  }}
                                />
                                <span
                                  className={`capitalize ${
                                    isDark ? "text-foreground" : "text-gray-900"
                                  }`}
                                >
                                  {type}
                                </span>
                                <span
                                  className={`text-sm ${
                                    isDark
                                      ? "text-muted-foreground"
                                      : "text-gray-500"
                                  }`}
                                >
                                  ({data.count}{" "}
                                  {data.count === 1 ? "grade" : "grades"})
                                </span>
                              </div>
                              <span
                                className={`font-bold ${getScoreColor(
                                  data.average
                                )}`}
                              >
                                {data.average}%
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p
                    className={
                      isDark ? "text-muted-foreground" : "text-gray-500"
                    }
                  >
                    No grades recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`text-center py-12 ${
              isDark ? "text-muted-foreground" : "text-gray-500"
            }`}
          >
            {classes.length === 0 ? (
              <p>
                You are not enrolled in any classes yet. Join a class to see
                your portfolio.
              </p>
            ) : (
              <p>Select a class to view your portfolio.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
