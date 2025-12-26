import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {quizAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const QuizStats = () => {
  const {quizId} = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [stats, setStats] = useState([]);
  const [classAverage, setClassAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (percentage >= 90) return "text-green-400";
    if (percentage >= 75) return "text-blue-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getGradeBg = (percentage) => {
    if (percentage >= 90) return "bg-green-900/30";
    if (percentage >= 75) return "bg-blue-900/30";
    if (percentage >= 60) return "bg-yellow-900/30";
    return "bg-red-900/30";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
        >
          ← Back to Quizzes
        </button>
        <h1 className="text-3xl font-bold text-white">{quiz?.topic}</h1>
        <p className="text-gray-400 mt-1">{quiz?.chapter}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Questions</p>
          <p className="text-2xl font-bold text-white">
            {quiz?.numberOfQuestions || 0}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Attempts</p>
          <p className="text-2xl font-bold text-white">{stats.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Class Average</p>
          <p className={`text-2xl font-bold ${getGradeColor(classAverage)}`}>
            {classAverage}%
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Pass Rate</p>
          <p className="text-2xl font-bold text-green-400">
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Student Results</h2>
        </div>

        {stats.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-400">
              No students have attempted this quiz yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Attempted At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {stats
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((student, index) => (
                    <tr
                      key={student.studentId}
                      className={`${getGradeBg(
                        student.percentage
                      )} hover:bg-zinc-800/50`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">
                          {index === 0 && "🥇"}
                          {index === 1 && "🥈"}
                          {index === 2 && "🥉"}
                          {index > 2 && `#${index + 1}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white">{student.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-400">
                          {student.rollNumber || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white">
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
                        <span className="text-gray-400">
                          {student.timeTaken
                            ? `${Math.floor(student.timeTaken / 60)}m ${
                                student.timeTaken % 60
                              }s`
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-400">
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
  );
};

export default QuizStats;
