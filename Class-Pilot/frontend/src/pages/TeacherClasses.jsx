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

  const inputClass = `w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? "bg-input-background border-border text-foreground"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className={`text-2xl font-semibold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              My Classes
            </h1>
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              Manage your classes and students
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isDark
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            <span>+</span>
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

        {/* Create Form */}
        {showCreateForm && (
          <div
            className={`rounded-xl border p-6 mb-6 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Create New Class
            </h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? "text-foreground" : "text-gray-700"
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
                      isDark ? "text-foreground" : "text-gray-700"
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
                      isDark ? "text-foreground" : "text-gray-700"
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
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? "Creating..." : "Create Class"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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

        {/* Classes Grid */}
        {classes.length === 0 ? (
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
              No classes yet
            </h3>
            <p
              className={`mb-6 ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              Create your first class to get started with Class Pilot
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div
                key={classItem._id}
                className={`rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  isDark
                    ? "bg-card border-border hover:border-ring"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        className={`font-semibold ${
                          isDark ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        {classItem.className}
                      </h3>
                      <p
                        className={`text-sm ${
                          isDark ? "text-muted-foreground" : "text-gray-500"
                        }`}
                      >
                        {classItem.subject}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-muted-foreground" : "text-gray-400"
                        }`}
                      >
                        {classItem.board}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                      {classItem.students?.length || 0} students
                    </span>
                  </div>

                  <div className="mb-4">
                    <p
                      className={`text-sm ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Class Code
                    </p>
                    <p className="font-mono text-lg font-bold text-blue-600">
                      {classItem.classCode}
                    </p>
                  </div>

                  <p
                    className={`text-xs mb-4 ${
                      isDark ? "text-muted-foreground" : "text-gray-400"
                    }`}
                  >
                    Created:{" "}
                    {new Date(classItem.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      to={`/class/${classItem._id}`}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium text-center transition-colors ${
                        isDark
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(classItem.classCode)
                      }
                      className={`py-2 px-4 rounded-md text-sm font-medium border transition-colors ${
                        isDark
                          ? "border-border text-foreground hover:bg-accent"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClasses;
