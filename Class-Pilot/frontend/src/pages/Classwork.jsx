import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useTheme} from "../hooks/useTheme";
import {classworkAPI} from "../services/api";
import {LoadingSpinner, Alert} from "../components/shared";

const Classwork = ({classId, isTeacher}) => {
  const {theme} = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [classwork, setClasswork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [newSection, setNewSection] = useState({
    sectionName: "",
    description: "",
  });
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchClasswork();
  }, [classId]);

  const fetchClasswork = async () => {
    try {
      setIsLoading(true);
      const response = await classworkAPI.getClasswork(classId);
      setClasswork(response.data.data);
      // Expand all sections by default
      const expanded = {};
      response.data.data?.sections?.forEach((s) => {
        expanded[s._id] = true;
      });
      setExpandedSections(expanded);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load classwork");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSection.sectionName.trim()) return;

    try {
      await classworkAPI.createSection({
        classId,
        ...newSection,
      });
      setNewSection({sectionName: "", description: ""});
      setShowSectionForm(false);
      fetchClasswork();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Delete this section? Items will become uncategorized."))
      return;
    try {
      await classworkAPI.deleteSection(sectionId);
      fetchClasswork();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete section");
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getItemIcon = (type) => {
    const icons = {
      assignment: "📋",
      quiz: "📝",
      material: "📁",
    };
    return icons[type] || "📄";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Header with Create Button */}
      {isTeacher && (
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-lg font-semibold ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            Organize your classwork
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSectionForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <span>➕</span> Create Section
            </button>
          </div>
        </div>
      )}

      {/* Create Section Form */}
      {showSectionForm && (
        <div
          className={`rounded-xl border p-4 mb-6 ${
            isDark ? "bg-card border-border" : "bg-white border-gray-200"
          }`}
        >
          <form onSubmit={handleCreateSection}>
            <h3
              className={`font-medium mb-3 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              New Section
            </h3>
            <input
              type="text"
              placeholder="Section name (e.g., Chapter 1: Introduction)"
              value={newSection.sectionName}
              onChange={(e) =>
                setNewSection((prev) => ({
                  ...prev,
                  sectionName: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg mb-3 ${
                isDark
                  ? "bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newSection.description}
              onChange={(e) =>
                setNewSection((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg mb-3 ${
                isDark
                  ? "bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSectionForm(false);
                  setNewSection({sectionName: "", description: ""});
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isDark
                    ? "text-muted-foreground hover:bg-accent"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newSection.sectionName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          icon="📋"
          value={classwork?.summary?.totalAssignments || 0}
          label="Assignments"
          isDark={isDark}
        />
        <StatCard
          icon="📝"
          value={classwork?.summary?.totalQuizzes || 0}
          label="Quizzes"
          isDark={isDark}
        />
        <StatCard
          icon="📁"
          value={classwork?.summary?.totalSections || 0}
          label="Sections"
          isDark={isDark}
        />
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {classwork?.sections?.map((section) => (
          <SectionCard
            key={section._id}
            section={section}
            isDark={isDark}
            isTeacher={isTeacher}
            isExpanded={expandedSections[section._id]}
            onToggle={() => toggleSection(section._id)}
            onDelete={() => handleDeleteSection(section._id)}
            getItemIcon={getItemIcon}
            formatDate={formatDate}
            navigate={navigate}
            classId={classId}
          />
        ))}

        {/* Uncategorized Items */}
        {(classwork?.uncategorized?.assignments?.length > 0 ||
          classwork?.uncategorized?.quizzes?.length > 0) && (
          <div
            className={`rounded-xl border ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <div className="p-4 border-b border-border">
              <h3
                className={`font-medium ${
                  isDark ? "text-foreground" : "text-gray-900"
                }`}
              >
                📂 Uncategorized
              </h3>
            </div>
            <div className="divide-y divide-border">
              {classwork?.uncategorized?.assignments?.map((item) => (
                <ItemRow
                  key={item._id}
                  item={item}
                  type="assignment"
                  isDark={isDark}
                  getItemIcon={getItemIcon}
                  formatDate={formatDate}
                  onClick={() => navigate(`/assignments/${item._id}`)}
                />
              ))}
              {classwork?.uncategorized?.quizzes?.map((item) => (
                <ItemRow
                  key={item._id}
                  item={item}
                  type="quiz"
                  isDark={isDark}
                  getItemIcon={getItemIcon}
                  formatDate={formatDate}
                  onClick={() => navigate(`/quiz/${item._id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {classwork?.sections?.length === 0 &&
          classwork?.uncategorized?.assignments?.length === 0 &&
          classwork?.uncategorized?.quizzes?.length === 0 && (
            <div
              className={`text-center py-12 rounded-xl border ${
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              }`}
            >
              <span className="text-4xl mb-4 block">📚</span>
              <p
                className={`${
                  isDark ? "text-muted-foreground" : "text-gray-500"
                }`}
              >
                No classwork yet
              </p>
              {isTeacher && (
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-muted-foreground" : "text-gray-400"
                  }`}
                >
                  Create assignments and quizzes to organize here
                </p>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

const StatCard = ({icon, value, label, isDark}) => (
  <div
    className={`p-4 rounded-xl border text-center ${
      isDark ? "bg-card border-border" : "bg-white border-gray-200"
    }`}
  >
    <span className="text-2xl">{icon}</span>
    <p
      className={`text-2xl font-bold mt-1 ${
        isDark ? "text-foreground" : "text-gray-900"
      }`}
    >
      {value}
    </p>
    <p
      className={`text-sm ${
        isDark ? "text-muted-foreground" : "text-gray-500"
      }`}
    >
      {label}
    </p>
  </div>
);

const SectionCard = ({
  section,
  isDark,
  isTeacher,
  isExpanded,
  onToggle,
  onDelete,
  getItemIcon,
  formatDate,
  navigate,
}) => (
  <div
    className={`rounded-xl border overflow-hidden ${
      isDark ? "bg-card border-border" : "bg-white border-gray-200"
    }`}
  >
    <button
      onClick={onToggle}
      className={`w-full p-4 flex items-center justify-between ${
        isDark ? "hover:bg-accent" : "hover:bg-gray-50"
      } transition-colors`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{isExpanded ? "📂" : "📁"}</span>
        <div className="text-left">
          <h3
            className={`font-medium ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            {section.sectionName}
          </h3>
          {section.description && (
            <p
              className={`text-sm ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              {section.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm ${
            isDark ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          {section.items?.length || 0} items
        </span>
        {isTeacher && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={`p-1 rounded text-red-500 ${
              isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
            }`}
          >
            🗑️
          </button>
        )}
        <span
          className={`transform transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </div>
    </button>

    {isExpanded && section.items?.length > 0 && (
      <div className="divide-y divide-border border-t border-border">
        {section.items.map((item, idx) => (
          <ItemRow
            key={idx}
            item={item.data || item.material}
            type={item.itemType}
            isDark={isDark}
            getItemIcon={getItemIcon}
            formatDate={formatDate}
            onClick={() => {
              if (item.itemType === "assignment") {
                navigate(`/assignments/${item.itemId}`);
              } else if (item.itemType === "quiz") {
                navigate(`/quiz/${item.itemId}`);
              }
            }}
          />
        ))}
      </div>
    )}

    {isExpanded && (!section.items || section.items.length === 0) && (
      <div
        className={`p-4 text-center border-t ${
          isDark
            ? "border-border text-muted-foreground"
            : "border-gray-200 text-gray-500"
        }`}
      >
        <p className="text-sm">No items in this section</p>
      </div>
    )}
  </div>
);

const ItemRow = ({item, type, isDark, getItemIcon, formatDate, onClick}) => {
  if (!item) return null;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-4 text-left ${
        isDark ? "hover:bg-accent" : "hover:bg-gray-50"
      } transition-colors`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          type === "assignment"
            ? "bg-purple-500/20"
            : type === "quiz"
            ? "bg-green-500/20"
            : "bg-gray-500/20"
        }`}
      >
        <span className="text-xl">{getItemIcon(type)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium truncate ${
            isDark ? "text-foreground" : "text-gray-900"
          }`}
        >
          {item.title || item.topic || item.name || "Untitled"}
        </p>
        <p
          className={`text-sm ${
            isDark ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          {type === "assignment" &&
            item.dueDate &&
            `Due: ${formatDate(item.dueDate)}`}
          {type === "quiz" && item.chapter && `Chapter: ${item.chapter}`}
          {type === "material" && item.description}
        </p>
      </div>
      <span
        className={`text-sm ${
          isDark ? "text-muted-foreground" : "text-gray-400"
        }`}
      >
        →
      </span>
    </button>
  );
};

export default Classwork;
