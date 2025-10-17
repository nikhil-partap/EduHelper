import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {classAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const StudentClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joining, setJoining] = useState(false);
  const [classCode, setClassCode] = useState("");

  // Fetch student's classes
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classAPI.getStudentClasses();
      setClasses(response.data.classes);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Join class with code
  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) return;

    try {
      setJoining(true);
      await classAPI.joinClass(classCode.trim().toUpperCase());
      setSuccess("Successfully joined the class!");
      setShowJoinForm(false);
      setClassCode("");
      fetchClasses(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join class");
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
          <p className="mt-2 text-gray-600">
            View and manage your enrolled classes
          </p>
        </div>
        <button
          onClick={() => setShowJoinForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
        >
          Join Class
        </button>
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

      {/* Join Class Form */}
      {showJoinForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Join a Class
          </h3>
          <form onSubmit={handleJoinClass} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="Enter class code (e.g., MATH-ABC123)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ask your teacher for the class code
              </p>
            </div>
            <button
              type="submit"
              disabled={joining}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
            >
              {joining ? "Joining..." : "Join"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowJoinForm(false);
                setClassCode("");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Classes List */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No classes joined yet
            </h3>
            <p className="text-gray-500 mb-6">
              Ask your teacher for a class code to join your first class
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {classItem.className}
                  </h3>
                  <p className="text-sm text-gray-600">{classItem.subject}</p>
                  <p className="text-xs text-gray-500">{classItem.board}</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Enrolled
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Teacher:</p>
                <p className="font-medium text-gray-900">
                  {classItem.teacherId?.name || "Loading..."}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Class Code:</p>
                <p className="font-mono text-sm font-bold text-blue-600">
                  {classItem.classCode}
                </p>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Joined: {new Date(classItem.updatedAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/class/${classItem._id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium text-center"
                >
                  View Details
                </Link>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium">
                  Assignments
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentClasses;
