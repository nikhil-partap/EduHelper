import {useState, useEffect} from "react";
import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {classAPI, studyPlannerAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

// Sortable Chapter Item Component
const SortableChapterItem = ({
  chapter,
  index,
  isDark,
  isTeacher,
  formatDate,
  getChapterStatus,
  StatusBadge,
  onEdit,
  onDelete,
}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} =
    useSortable({id: chapter._id || `chapter-${index}`});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const {status} = getChapterStatus(chapter);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border p-6 ${
        isDark ? "bg-card border-border" : "bg-white border-gray-200"
      } ${isDragging ? "shadow-2xl ring-2 ring-blue-500" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isTeacher && (
            <div
              {...attributes}
              {...listeners}
              className={`cursor-grab active:cursor-grabbing p-2 rounded-lg transition-colors ${
                isDark ? "hover:bg-zinc-700" : "hover:bg-gray-100"
              }`}
              title="Drag to reorder"
            >
              <span className="text-xl">⋮⋮</span>
            </div>
          )}
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
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              {chapter.chapterName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          {isTeacher && (
            <>
              <button
                onClick={() => onEdit(index, chapter)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-zinc-700 text-blue-400"
                    : "hover:bg-gray-100 text-blue-600"
                }`}
                title="Edit chapter"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(index)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-zinc-700 text-red-400"
                    : "hover:bg-gray-100 text-red-600"
                }`}
                title="Delete chapter"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`px-2 py-1 text-xs rounded-md border ${
            isDark
              ? "border-border text-muted-foreground"
              : "border-gray-200 text-gray-600"
          }`}
        >
          {formatDate(chapter.startDate)} - {formatDate(chapter.endDate)}
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
};

// Edit Chapter Modal
const EditChapterModal = ({chapter, index, isDark, onSave, onClose}) => {
  const [formData, setFormData] = useState({
    chapterName: chapter.chapterName || "",
    durationDays: chapter.durationDays || 5,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(index, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`w-full max-w-md rounded-xl p-6 ${
          isDark ? "bg-card border border-border" : "bg-white"
        }`}
      >
        <h2
          className={`text-lg font-semibold mb-4 ${
            isDark ? "text-foreground" : "text-gray-900"
          }`}
        >
          Edit Chapter (Week {index + 1})
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-foreground" : "text-gray-700"
              }`}
            >
              Chapter Name
            </label>
            <input
              type="text"
              value={formData.chapterName}
              onChange={(e) =>
                setFormData({...formData, chapterName: e.target.value})
              }
              className={`w-full px-3 py-2 rounded-md border ${
                isDark
                  ? "bg-input-background border-border text-foreground"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              required
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-foreground" : "text-gray-700"
              }`}
            >
              Duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.durationDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationDays: parseInt(e.target.value) || 1,
                })
              }
              className={`w-full px-3 py-2 rounded-md border ${
                isDark
                  ? "bg-input-background border-border text-foreground"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
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
    </div>
  );
};

// Timeline/Gantt View Component
const TimelineView = ({chapters, isDark, formatDate}) => {
  if (!chapters || chapters.length === 0) return null;

  const allDates = chapters.flatMap((ch) => [
    new Date(ch.startDate),
    new Date(ch.endDate),
  ]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

  const getBarPosition = (start, end) => {
    const startOffset = Math.ceil(
      (new Date(start) - minDate) / (1000 * 60 * 60 * 24)
    );
    const duration =
      Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  const colors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-green-500 to-green-600",
    "from-orange-500 to-orange-600",
    "from-pink-500 to-pink-600",
    "from-cyan-500 to-cyan-600",
  ];

  return (
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
        📊 Timeline View
      </h2>
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>{formatDate(minDate)}</span>
        <span>{formatDate(maxDate)}</span>
      </div>
      <div className="space-y-3">
        {chapters.map((chapter, index) => {
          const {left, width} = getBarPosition(
            chapter.startDate,
            chapter.endDate
          );
          return (
            <div key={index} className="relative">
              <div
                className={`text-xs mb-1 truncate ${
                  isDark ? "text-muted-foreground" : "text-gray-600"
                }`}
              >
                {chapter.chapterName}
              </div>
              <div
                className={`h-3 rounded-full ${
                  isDark ? "bg-zinc-800" : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    colors[index % colors.length]
                  } transition-all duration-300`}
                  style={{marginLeft: left, width}}
                  title={`${formatDate(chapter.startDate)} - ${formatDate(
                    chapter.endDate
                  )}`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {chapters.slice(0, 6).map((_, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                colors[index % colors.length]
              }`}
            />
            <span
              className={`text-xs ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              W{index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [showTimeline, setShowTimeline] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingYear, setEditingYear] = useState(false);
  const currentYear = new Date().getFullYear();
  const [generateForm, setGenerateForm] = useState({
    board: "CBSE",
    className: "10th",
    subject: "Mathematics",
    academicYear: currentYear,
  });
  const [generating, setGenerating] = useState(false);

  const isTeacher = user?.role === "teacher";

  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 8}}),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
  );

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
      setClasses(response.data.classes || []);
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

  const handleDragEnd = async (event) => {
    const {active, over} = event;
    if (!over || active.id === over.id || !isTeacher) return;

    const oldIndex = planner.chapters.findIndex(
      (ch, i) => (ch._id || `chapter-${i}`) === active.id
    );
    const newIndex = planner.chapters.findIndex(
      (ch, i) => (ch._id || `chapter-${i}`) === over.id
    );
    if (oldIndex === -1 || newIndex === -1) return;

    const newChapters = arrayMove(planner.chapters, oldIndex, newIndex);
    setPlanner((prev) => ({...prev, chapters: newChapters}));

    try {
      const response = await studyPlannerAPI.reorderChapters(
        selectedClassId,
        oldIndex,
        newIndex
      );
      setPlanner(response.data.planner);
      setSuccess("Chapters reordered!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      await fetchPlanner(selectedClassId);
      setError(err.response?.data?.message || "Failed to reorder chapters");
    }
  };

  const handleEditChapter = (index, chapter) => {
    setEditingChapter({index, chapter});
  };

  const handleSaveChapter = async (index, data) => {
    try {
      const response = await studyPlannerAPI.updateChapter(
        selectedClassId,
        index,
        data
      );
      setPlanner(response.data.planner);
      setEditingChapter(null);
      setSuccess("Chapter updated!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update chapter");
    }
  };

  const handleDeleteChapter = async (index) => {
    if (!confirm(`Delete Week ${index + 1}? This cannot be undone.`)) return;
    try {
      const response = await studyPlannerAPI.deleteChapter(
        selectedClassId,
        index
      );
      setPlanner(response.data.planner);
      setSuccess("Chapter deleted!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete chapter");
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

  const handleUpdateYear = async (newYear) => {
    try {
      const response = await studyPlannerAPI.updateAcademicYear(
        selectedClassId,
        newYear
      );
      setPlanner(response.data.planner);
      setEditingYear(false);
      setSuccess("Academic year updated! All dates recalculated.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update academic year");
    }
  };

  const handleDeletePlanner = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this entire study planner? This action cannot be undone!"
      )
    )
      return;
    if (
      !confirm(
        "This will permanently delete all chapters, holidays, and exam dates. Continue?"
      )
    )
      return;

    try {
      await studyPlannerAPI.deletePlanner(selectedClassId);
      setPlanner(null);
      setSuccess("Study planner deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete study planner");
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
    const icons = {completed: "✓", "in-progress": "⏱", upcoming: "📅"};
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
        {/* Edit Modal */}
        {editingChapter && (
          <EditChapterModal
            chapter={editingChapter.chapter}
            index={editingChapter.index}
            isDark={isDark}
            onSave={handleSaveChapter}
            onClose={() => setEditingChapter(null)}
          />
        )}

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
          <div className="flex gap-2">
            {planner && (
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showTimeline
                    ? "bg-blue-600 text-white"
                    : isDark
                    ? "bg-secondary text-secondary-foreground hover:bg-accent"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📊 {showTimeline ? "Hide" : "Show"} Timeline
              </button>
            )}
            {isTeacher && selectedClassId && !planner && (
              <button
                onClick={() => setShowGenerateForm(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDark
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                ✨ Generate New Plan
              </button>
            )}
          </div>
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
              ? "Drag chapters to reorder, click ✏️ to edit, or 🗑️ to delete. Timeline auto-adjusts."
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
                {cls.className} - {cls.subject}
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
                : "Your teacher hasn't created a study planner yet"}
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
                {isTeacher && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDark
                        ? "bg-green-950 text-green-300"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    ⋮⋮ Drag | ✏️ Edit | 🗑️ Delete
                  </span>
                )}
              </div>
            </div>

            {/* Timeline View */}
            {showTimeline && (
              <TimelineView
                chapters={planner.chapters}
                isDark={isDark}
                formatDate={formatDate}
              />
            )}

            {/* Chapters with Drag-Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={
                  planner.chapters?.map((ch, i) => ch._id || `chapter-${i}`) ||
                  []
                }
                strategy={verticalListSortingStrategy}
                disabled={!isTeacher}
              >
                <div className="space-y-4">
                  {planner.chapters?.map((chapter, index) => (
                    <SortableChapterItem
                      key={chapter._id || `chapter-${index}`}
                      chapter={chapter}
                      index={index}
                      isDark={isDark}
                      isTeacher={isTeacher}
                      formatDate={formatDate}
                      getChapterStatus={getChapterStatus}
                      StatusBadge={StatusBadge}
                      onEdit={handleEditChapter}
                      onDelete={handleDeleteChapter}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

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
