import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";

import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {LoadingSpinner, Alert} from "../components/shared";
import {classAPI, assignmentAPI} from "../services/api";

const Assignments = () => {
  const {user} = useAuth();
  const {theme} = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const isTeacher = user?.role === "teacher";

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = isTeacher
        ? await classAPI.getTeacherClasses()
        : await classAPI.getStudentClasses();
      setClasses(response.data.classes || []);
      if (response.data.classes?.length > 0) {
        setSelectedClass(response.data.classes[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch classes");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await assignmentAPI.getClassAssignments(selectedClass);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await assignmentAPI.deleteAssignment(assignmentId);
      setSuccess("Assignment deleted successfully");
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete assignment");
    }
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const mySubmission = assignment.submissions?.find(
      (s) => s.studentId === user?.id || s.studentId?._id === user?.id
    );

    if (mySubmission?.status === "graded") {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          Graded
        </span>
      );
    }
    if (mySubmission) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          Submitted
        </span>
      );
    }
    if (now > dueDate) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          Overdue
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  if (isLoading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-6 ${isDark ? "bg-background" : "bg-gray-50"}`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1
              className={`text-2xl font-semibold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Assignments
            </h1>
            <p
              className={`${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              {isTeacher
                ? "Create and manage assignments"
                : "View and submit your assignments"}
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`px-4 py-2 rounded-md border text-sm ${
                isDark
                  ? "bg-input-background text-foreground border-input"
                  : "bg-white text-gray-900 border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-ring`}
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} - {cls.subject}
                </option>
              ))}
            </select>
            {isTeacher && (
              <button
                onClick={() => setShowCreateModal(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDark
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                + Create Assignment
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : assignments.length === 0 ? (
          <div
            className={`text-center py-12 rounded-xl border ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <span className="text-4xl mb-4 block">📋</span>
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              No assignments found for this class
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className={`rounded-xl p-6 border transition-all hover:shadow-md ${
                  isDark
                    ? "bg-card border-border hover:border-ring"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className={`text-lg font-semibold ${
                          isDark ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        {assignment.title}
                      </h3>
                      {!isTeacher && getStatusBadge(assignment)}
                    </div>
                    <p
                      className={`text-sm mb-3 ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      {assignment.description}
                    </p>
                    <div
                      className={`flex flex-wrap gap-4 text-sm ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <span>📅</span> Due:{" "}
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📊</span> Marks: {assignment.totalMarks}
                      </span>
                      {isTeacher && (
                        <span className="flex items-center gap-1">
                          <span>📥</span> Submissions:{" "}
                          {assignment.submissions?.length || 0}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/assignment/${assignment._id}`)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        isDark
                          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {isTeacher ? "View" : "Open"}
                    </button>
                    {isTeacher && (
                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="px-3 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateAssignmentModal
            classId={selectedClass}
            isDark={isDark}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              setSuccess("Assignment created successfully");
              fetchAssignments();
            }}
          />
        )}
      </div>
    </div>
  );
};

const CreateAssignmentModal = ({classId, isDark, onClose, onSuccess}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    totalMarks: 100,
    allowLateSubmission: false,
    latePenalty: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await assignmentAPI.createAssignment({...formData, classId});
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full px-3 py-2 rounded-md border text-sm ${
    isDark
      ? "bg-input-background text-foreground border-input focus:border-ring"
      : "bg-white text-gray-900 border-gray-300 focus:border-gray-400"
  } focus:outline-none focus:ring-2 focus:ring-ring/50`;

  const labelClass = `block text-sm font-medium mb-1.5 ${
    isDark ? "text-foreground" : "text-gray-700"
  }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border ${
          isDark ? "bg-card border-border" : "bg-white border-gray-200"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            isDark ? "text-foreground" : "text-gray-900"
          }`}
        >
          Create New Assignment
        </h2>
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Due Date *</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Total Marks *</label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                min={1}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label
              className={`flex items-center gap-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <input
                type="checkbox"
                name="allowLateSubmission"
                checked={formData.allowLateSubmission}
                onChange={handleChange}
                className="rounded"
              />
              Allow late submission
            </label>
            {formData.allowLateSubmission && (
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Penalty:
                </span>
                <input
                  type="number"
                  name="latePenalty"
                  value={formData.latePenalty}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  className={`w-16 px-2 py-1 rounded border ${
                    isDark
                      ? "bg-zinc-700 text-white border-zinc-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                />
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  %
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded transition-colors ${
                isDark
                  ? "bg-zinc-600 text-white hover:bg-zinc-500"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Assignments;
