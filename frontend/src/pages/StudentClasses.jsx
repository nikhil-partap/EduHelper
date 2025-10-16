import {useState, useEffect} from "react";
import {useAuth} from "../context/AuthContext";
import LoadingSpinner from "../components/shared/LoadingSpinner";

const StudentClasses = () => {
  const {user} = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [classCode, setClassCode] = useState("");

  useEffect(() => {
    // TODO: Fetch student's classes from API
    setTimeout(() => {
      setClasses([]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleJoinClass = (e) => {
    e.preventDefault();
    // TODO: Implement join class functionality
    console.log("Joining class with code:", classCode);
    setShowJoinForm(false);
    setClassCode("");
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

      {showJoinForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Join a Class
          </h3>
          <form onSubmit={handleJoinClass} className="flex gap-4">
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              placeholder="Enter class code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => setShowJoinForm(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

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
    </div>
  );
};

export default StudentClasses;
