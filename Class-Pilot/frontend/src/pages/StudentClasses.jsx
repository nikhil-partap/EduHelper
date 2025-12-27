import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useClass} from "../hooks/useClass";
import {useTheme} from "../hooks/useTheme";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const StudentClasses = () => {
  const {classes, loading, error, fetchClasses, joinClass, clearError} =
    useClass();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const [success, setSuccess] = useState(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joining, setJoining] = useState(false);
  const [classCode, setClassCode] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    try {
      setJoining(true);
      const result = await joinClass(classCode.trim().toUpperCase());
      if (result.success) {
        setSuccess(result.message || "Successfully joined the class!");
        setShowJoinForm(false);
        setClassCode("");
        setTimeout(() => setSuccess(null), 3000);
      }
    } finally {
      setJoining(false);
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
              View and manage your enrolled classes
            </p>
          </div>
          <button
            onClick={() => setShowJoinForm(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isDark
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            <span>+</span>
            Join Class
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

        {/* Join Form */}
        {showJoinForm && (
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
              Join a Class
            </h3>
            <form onSubmit={handleJoinClass} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="Enter class code (e.g., MATH-ABC123)"
                  className={inputClass}
                  required
                />
                <p
                  className={`text-xs mt-1 ${
                    isDark ? "text-muted-foreground" : "text-gray-400"
                  }`}
                >
                  Ask your teacher for the class code
                </p>
              </div>
              <button
                type="submit"
                disabled={joining}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {joining ? "Joining..." : "Join"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowJoinForm(false);
                  setClassCode("");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDark
                    ? "bg-secondary text-secondary-foreground hover:bg-accent"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
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
              No classes joined yet
            </h3>
            <p
              className={`mb-6 ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              Ask your teacher for a class code to join your first class
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
                <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-600" />
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
                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800">
                      Enrolled
                    </span>
                  </div>

                  <div className="mb-4">
                    <p
                      className={`text-sm ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Teacher
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-foreground" : "text-gray-900"
                      }`}
                    >
                      {classItem.teacherId?.name || "Loading..."}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p
                      className={`text-sm ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Class Code
                    </p>
                    <p className="font-mono text-sm font-bold text-blue-600">
                      {classItem.classCode}
                    </p>
                  </div>

                  <p
                    className={`text-xs mb-4 ${
                      isDark ? "text-muted-foreground" : "text-gray-400"
                    }`}
                  >
                    Joined: {new Date(classItem.updatedAt).toLocaleDateString()}
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
                    <Link
                      to="/assignments"
                      className={`py-2 px-4 rounded-md text-sm font-medium border transition-colors ${
                        isDark
                          ? "border-border text-foreground hover:bg-accent"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Assignments
                    </Link>
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

export default StudentClasses;
