import {useState, useEffect} from "react";
import {useAuth} from "../context/AuthContext";
import LoadingSpinner from "../components/shared/LoadingSpinner";

const TeacherClasses = () => {
  const {user} = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch teacher's classes from API
    setTimeout(() => {
      setClasses([]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your classes..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <p className="mt-2 text-gray-600">Manage your classes and students</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No classes yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first class to get started with Class Pilot
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium">
            Create New Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherClasses;
