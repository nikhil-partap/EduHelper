import {useState, useEffect} from "react";
import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {classAPI, studyPlannerAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const StudyPlanner = () => {
  const {user} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    board: "CBSE",
    className: "10th",
    subject: "Mathematics",
  });
  const [generating, setGenerating] = useState(false);

  const isTeacher = user?.role === "teacher";

  useEffect(() => {
    fetchClasses();
  }, [user]);

  useEffect(() => {
    if (selectedClassId) {
      fetchPlanner(selectedClassId);
    } else {
      setPlanner(null);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = isTeacher
        ? await classAPI.getTeacherClasses()
        : await classAPI.getStudentClasses();
      setClasses(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanner = async (classId) => {
    try {
      setPlannerLoading(true);
      setError(null);
      const response = await studyPlannerAPI.getPlanner(classId);
      setPlanner(response.data.planner);
    } catch (err) {
      if (err.response?.status === 404) {
        setPlanner(null);
      } else {
        setError(
          err.response?.data?.message || "Failed to fetch study planner"
        );
      }
    } finally {
      setPlannerLoading(false);
    }
  };

  const handleGeneratePlanner = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      setError("Please select a class first");
      return;
    }
    try {
      setGenerating(true);
      setError(null);
      const response = await studyPlannerAPI.generatePlanner({
        classId: selectedClassId,
        ...generateForm,
      });
      setPlanner(response.data.planner);
      setSuccess("Study planner generated successfully!");
      setShowGenerateForm(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate study planner"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleAddHoliday = async (date) => {
    try {
      const response = await studyPlannerAPI.addHoliday(selectedClassId, date);
      setPlanner(response.data.planner);
      setSuccess("Holiday added");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add holiday");
    }
  };

  const handleAddExam = async (examName, date) => {
    try {
      const response = await studyPlannerAPI.addExamDate(
        selectedClassId,
        examName,
        date
      );
      setPlanner(response.data.planner);
      setSuccess("Exam date added");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add exam date");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getChapterStatus = (chapter) => {
    const today = new Date();
    const start = new Date(chapter.startDate);
    const end = new Date(chapter.endDate);
    if (today < start) return {status: "upcoming", color: "bg-gray-500"};
    if (today > end) return {status: "completed", color: "bg-green-500"};
    return {status: "in-progress", color: "bg-blue-500"};
  };

  const StatusBadge = ({status}) => {
    const styles = {
      completed: isDark
        ? "bg-primary text-primary-foreground"
        : "bg-gray-900 text-white",
      "in-progress": isDark
        ? "bg-secondary text-secondary-foreground"
        : "bg-gray-100 text-gray-700",
      upcoming: isDark
        ? "border border-border text-foreground"
        : "border border-gray-200 text-gray-600",
    };
    const icons = {
      completed: "✓",
      "in-progress": "⏱",
      upcoming: "📅",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${styles[status]}`}
      >
        <span>{icons[status]}</span>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className={`text-2xl font-semibold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Study Planner
            </h1>
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              {isTeacher
                ? "AI-generated study schedule for your class"
                : "Your personalized study schedule"}
            </p>
          </div>
          {isTeacher && selectedClassId && !planner && (
            <button
              onClick={() => setShowGenerateForm(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isDark
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              <span>✨</span>
              Generate New Plan
            </button>
          )}
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

        {/* AI Info Card */}
        <div
          className={`rounded-xl p-6 mb-6 ${
            isDark
              ? "bg-gradient-to-br from-blue-950 to-purple-950 border border-blue-900"
              : "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-600">✨</span>
            <h2
              className={`font-semibold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              AI-Powered Study Plan
            </h2>
          </div>
          <p className={isDark ? "text-muted-foreground" : "text-gray-600"}>
            {isTeacher
              ? "Automatically generated based on curriculum, holidays, and exam dates"
              : "Follow this schedule to stay on track with your coursework"}
          </p>
        </div>

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
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className={`w-full md:w-1/2 px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? "bg-input-background border-border text-foreground"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">-- Select a class --</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Planner Form */}
        {showGenerateForm && isTeacher && (
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
              Generate Study Planner
            </h2>
            <form onSubmit={handleGeneratePlanner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    Board
                  </label>
                  <select
                    value={generateForm.board}
                    onChange={(e) =>
                      setGenerateForm({...generateForm, board: e.target.value})
                    }
                    className={`w-full px-3 py-2 rounded-md border ${
                      isDark
                        ? "bg-input-background border-border text-foreground"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">IB</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    Class
                  </label>
                  <select
                    value={generateForm.className}
                    onChange={(e) =>
                      setGenerateForm({
                        ...generateForm,
                        className: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 rounded-md border ${
                      isDark
                        ? "bg-input-background border-border text-foreground"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    {["6th", "7th", "8th", "9th", "10th", "11th", "12th"].map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    value={generateForm.subject}
                    onChange={(e) =>
                      setGenerateForm({
                        ...generateForm,
                        subject: e.target.value,
                      })
                    }
                    placeholder="e.g., Mathematics"
                    className={`w-full px-3 py-2 rounded-md border ${
                      isDark
                        ? "bg-input-background border-border text-foreground"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {generating ? "Generating..." : "Generate with AI"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateForm(false)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    isDark
                      ? "bg-secondary text-secondary-foreground hover:bg-accent"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {plannerLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading study planner..." />
          </div>
        )}

        {!selectedClassId && !plannerLoading && (
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
              Choose a class above to view or generate its study planner
            </p>
          </div>
        )}

        {selectedClassId && !planner && !plannerLoading && (
          <div
            className={`rounded-xl border p-12 text-center ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <div className="text-6xl mb-4">📅</div>
            <h3
              className={`text-lg font-medium mb-2 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              No Study Planner Yet
            </h3>
            <p
              className={`mb-4 ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              {isTeacher
                ? "Generate an AI-powered study planner for this class"
                : "Your teacher hasn't created a study planner for this class yet"}
            </p>
            {isTeacher && (
              <button
                onClick={() => setShowGenerateForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Generate Study Planner
              </button>
            )}
          </div>
        )}

        {planner && !plannerLoading && (
          <div className="space-y-6">
            {/* Planner Info */}
            <div
              className={`rounded-xl border p-6 ${
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    isDark
                      ? "bg-blue-950 text-blue-300"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {planner.board}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    isDark
                      ? "bg-purple-950 text-purple-300"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  Class {planner.className}
                </span>
                <span
                  className={`text-sm ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  Generated: {formatDate(planner.generatedAt)}
                </span>
              </div>
            </div>

            {/* Chapters */}
            <div className="space-y-4">
              {planner.chapters?.map((chapter, index) => {
                const {status} = getChapterStatus(chapter);
                return (
                  <div
                    key={index}
                    className={`rounded-xl border p-6 ${
                      isDark
                        ? "bg-card border-border"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xl">📖</span>
                        </div>
                        <div>
                          <h3
                            className={`font-semibold ${
                              isDark ? "text-foreground" : "text-gray-900"
                            }`}
                          >
                            Week {index + 1}
                          </h3>
                          <p
                            className={
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }
                          >
                            {chapter.chapterName}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-md border ${
                          isDark
                            ? "border-border text-muted-foreground"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        {formatDate(chapter.startDate)} -{" "}
                        {formatDate(chapter.endDate)}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-md border ${
                          isDark
                            ? "border-border text-muted-foreground"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        {chapter.durationDays} days
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Holidays & Exams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`rounded-xl border p-6 ${
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                }`}
              >
                <h2
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  Holidays ({planner.holidays?.length || 0})
                </h2>
                {planner.holidays?.length > 0 ? (
                  <ul className="space-y-2">
                    {planner.holidays.map((date, i) => (
                      <li
                        key={i}
                        className={`text-sm ${
                          isDark ? "text-muted-foreground" : "text-gray-600"
                        }`}
                      >
                        📅 {formatDate(date)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    className={`text-sm ${
                      isDark ? "text-muted-foreground" : "text-gray-500"
                    }`}
                  >
                    No holidays added
                  </p>
                )}
                {isTeacher && (
                  <button
                    onClick={() => {
                      const date = prompt("Enter holiday date (YYYY-MM-DD):");
                      if (date) handleAddHoliday(date);
                    }}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Holiday
                  </button>
                )}
              </div>

              <div
                className={`rounded-xl border p-6 ${
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                }`}
              >
                <h2
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  Exam Dates ({planner.examDates?.length || 0})
                </h2>
                {planner.examDates?.length > 0 ? (
                  <ul className="space-y-2">
                    {planner.examDates.map((exam, i) => (
                      <li
                        key={i}
                        className={`text-sm ${
                          isDark ? "text-muted-foreground" : "text-gray-600"
                        }`}
                      >
                        📝 {exam.examName} - {formatDate(exam.date)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    className={`text-sm ${
                      isDark ? "text-muted-foreground" : "text-gray-500"
                    }`}
                  >
                    No exam dates added
                  </p>
                )}
                {isTeacher && (
                  <button
                    onClick={() => {
                      const examName = prompt("Enter exam name:");
                      if (!examName) return;
                      const date = prompt("Enter exam date (YYYY-MM-DD):");
                      if (date) handleAddExam(examName, date);
                    }}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Exam Date
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanner;
