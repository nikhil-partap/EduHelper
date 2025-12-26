import {useState, useEffect} from "react";
import {useAuth} from "../hooks/useAuth";
import {classAPI, studyPlannerAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const StudyPlanner = () => {
  const {user} = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Generate planner form state (teacher only)
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    board: "CBSE",
    className: "10th",
    subject: "Mathematics",
  });
  const [generating, setGenerating] = useState(false);

  const isTeacher = user?.role === "teacher";

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, [user]);

  // Fetch planner when class is selected
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
        setPlanner(null); // No planner exists yet
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

    if (today < start) return {status: "upcoming", color: "bg-gray-600"};
    if (today > end) return {status: "completed", color: "bg-green-600"};
    return {status: "in-progress", color: "bg-blue-600"};
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Study Planner</h1>
        <p className="mt-2 text-gray-400">
          {isTeacher
            ? "Generate and manage AI-powered study plans for your classes"
            : "View your class study schedule"}
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

      {/* Class Selection */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Select Class
        </label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a class --</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>

        {isTeacher && selectedClassId && !planner && (
          <button
            onClick={() => setShowGenerateForm(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Generate Study Planner with AI
          </button>
        )}
      </div>

      {/* Generate Planner Form (Teacher Only) */}
      {showGenerateForm && isTeacher && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Generate Study Planner
          </h2>
          <form onSubmit={handleGeneratePlanner} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Board
                </label>
                <select
                  value={generateForm.board}
                  onChange={(e) =>
                    setGenerateForm({...generateForm, board: e.target.value})
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
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
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md"
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
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={generateForm.subject}
                  onChange={(e) =>
                    setGenerateForm({...generateForm, subject: e.target.value})
                  }
                  placeholder="e.g., Mathematics"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={generating}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-md font-medium"
              >
                {generating ? "Generating..." : "Generate with AI"}
              </button>
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 rounded-md font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Planner Loading */}
      {plannerLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading study planner..." />
        </div>
      )}

      {/* No Class Selected */}
      {!selectedClassId && !plannerLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-white mb-2">
            Select a Class
          </h3>
          <p className="text-gray-400">
            Choose a class above to view or generate its study planner
          </p>
        </div>
      )}

      {/* No Planner Exists */}
      {selectedClassId && !planner && !plannerLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-white mb-2">
            No Study Planner Yet
          </h3>
          <p className="text-gray-400 mb-4">
            {isTeacher
              ? "Generate an AI-powered study planner for this class"
              : "Your teacher hasn't created a study planner for this class yet"}
          </p>
          {isTeacher && (
            <button
              onClick={() => setShowGenerateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Generate Study Planner
            </button>
          )}
        </div>
      )}

      {/* Planner Display */}
      {planner && !plannerLoading && (
        <div className="space-y-6">
          {/* Planner Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full">
                {planner.board}
              </span>
              <span className="bg-purple-900 text-purple-200 px-3 py-1 rounded-full">
                Class {planner.className}
              </span>
              <span className="text-gray-400">
                Generated: {formatDate(planner.generatedAt)}
              </span>
            </div>
          </div>

          {/* Chapters Timeline */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Chapters ({planner.chapters?.length || 0})
            </h2>
            <div className="space-y-3">
              {planner.chapters?.map((chapter, index) => {
                const {status, color} = getChapterStatus(chapter);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${color}`}
                      title={status}
                    ></div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {index + 1}. {chapter.chapterName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatDate(chapter.startDate)} -{" "}
                        {formatDate(chapter.endDate)}
                        <span className="ml-2 text-gray-500">
                          ({chapter.durationDays} days)
                        </span>
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        status === "completed"
                          ? "bg-green-900 text-green-300"
                          : status === "in-progress"
                          ? "bg-blue-900 text-blue-300"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holidays & Exams (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Holidays */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Holidays ({planner.holidays?.length || 0})
              </h2>
              {planner.holidays?.length > 0 ? (
                <ul className="space-y-2">
                  {planner.holidays.map((date, i) => (
                    <li key={i} className="text-gray-300 text-sm">
                      📅 {formatDate(date)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No holidays added</p>
              )}
              {isTeacher && (
                <button
                  onClick={() => {
                    const date = prompt("Enter holiday date (YYYY-MM-DD):");
                    if (date) handleAddHoliday(date);
                  }}
                  className="mt-4 text-sm text-blue-400 hover:text-blue-300"
                >
                  + Add Holiday
                </button>
              )}
            </div>

            {/* Exam Dates */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Exam Dates ({planner.examDates?.length || 0})
              </h2>
              {planner.examDates?.length > 0 ? (
                <ul className="space-y-2">
                  {planner.examDates.map((exam, i) => (
                    <li key={i} className="text-gray-300 text-sm">
                      📝 {exam.examName} - {formatDate(exam.date)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No exam dates added</p>
              )}
              {isTeacher && (
                <button
                  onClick={() => {
                    const examName = prompt("Enter exam name:");
                    if (!examName) return;
                    const date = prompt("Enter exam date (YYYY-MM-DD):");
                    if (date) handleAddExam(examName, date);
                  }}
                  className="mt-4 text-sm text-blue-400 hover:text-blue-300"
                >
                  + Add Exam Date
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
