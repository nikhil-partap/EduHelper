import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";

import {useAuth} from "../hooks/useAuth";
import {LoadingSpinner, Alert} from "../components/shared";
import {classAPI, assignmentAPI} from "../services/api";

const Assignments = () => {
  const {user} = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
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

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">📝 Assignments</h1>
          <div className="flex gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Create Assignment
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No assignments found for this class</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {assignment.title}
                      </h3>
                      {!isTeacher && getStatusBadge(assignment)}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      {assignment.description}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>
                        📅 Due:{" "}
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      <span>📊 Marks: {assignment.totalMarks}</span>
                      {isTeacher && (
                        <span>
                          📥 Submissions: {assignment.submissions?.length || 0}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/assignment/${assignment._id}`)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      {isTeacher ? "View" : "Open"}
                    </button>
                    {isTeacher && (
                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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

const CreateAssignmentModal = ({classId, onClose, onSuccess}) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Create Assignment</h2>
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Instructions
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Due Date *
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Total Marks *
              </label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                min={1}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-gray-300">
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
                <span className="text-gray-300 text-sm">Penalty:</span>
                <input
                  type="number"
                  name="latePenalty"
                  value={formData.latePenalty}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
                />
                <span className="text-gray-300 text-sm">%</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
