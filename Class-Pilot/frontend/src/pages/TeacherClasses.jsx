import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useClass} from "../hooks/useClass";
import {useTheme} from "../hooks/useTheme";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const TeacherClasses = () => {
  const {classes, loading, error, fetchClasses, createClass, clearError} =
    useClass();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    className: "",
    subject: "",
    board: "",
  });

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const result = await createClass(formData);

      if (result.success) {
        setShowCreateForm(false);
        setFormData({className: "", subject: "", board: ""});
        setSuccess("Class created successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your classes..." />
      </div>
    );
  }

  const cardClass = `rounded-lg shadow p-6 transition-colors ${
    isDark
      ? "bg-zinc-900 border border-zinc-800"
      : "bg-white border border-gray-200"
  }`;

  const inputClass = `w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? "bg-zinc-800 border-zinc-700 text-white"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            My Classes
          </h1>
          <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Manage your classes and students
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
        >
          Create New Class
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={clearError} />}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {showCreateForm && (
        <div className={`${cardClass} mb-6`}>
          <h3
            className={`text-lg font-medium mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Create New Class
          </h3>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Class Name
                </label>
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  placeholder="e.g., 10th A"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Board
                </label>
                <select
                  name="board"
                  value={formData.board}
                  onChange={handleInputChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select Board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={creating}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Class"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className={`px-6 py-2 rounded-md font-medium ${
                  isDark
                    ? "bg-zinc-700 hover:bg-zinc-600 text-gray-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {classes.length === 0 ? (
        <div className={cardClass}>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3
              className={`text-lg font-medium mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              No classes yet
            </h3>
            <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Create your first class to get started with Class Pilot
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem._id}
              className={`${cardClass} hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {classItem.className}
                  </h3>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {classItem.subject}
                  </p>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {classItem.board}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  {classItem.students?.length || 0} students
                </span>
              </div>

              <div className="mb-4">
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Class Code:
                </p>
                <p className="font-mono text-lg font-bold text-blue-500">
                  {classItem.classCode}
                </p>
              </div>

              <div
                className={`text-xs mb-4 ${
                  isDark ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Created: {new Date(classItem.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/class/${classItem._id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium text-center"
                >
                  View Details
                </Link>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(classItem.classCode)
                  }
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    isDark
                      ? "bg-zinc-700 hover:bg-zinc-600 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Share Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
