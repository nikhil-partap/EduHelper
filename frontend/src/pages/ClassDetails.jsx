import {useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useClass} from "../hooks/useClass";
import {useAuth} from "../hooks/useAuth";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const ClassDetails = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {
    selectedClass: classData,
    loading,
    error,
    getClassDetails,
    clearError,
  } = useClass();

  useEffect(() => {
    if (id) {
      getClassDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading class details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" message={error} onClose={clearError} />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" message="Class not found" />
      </div>
    );
  }

  const isTeacher = user?.role === "teacher";
  const isOwner = isTeacher && classData.teacherId?._id === user?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Classes
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {classData.className}
              </h1>
              <p className="text-lg text-gray-600 mb-1">{classData.subject}</p>
              <p className="text-sm text-gray-500">{classData.board}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Class Code</p>
              <p className="font-mono text-xl font-bold text-blue-600">
                {classData.classCode}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Teacher Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Teacher Information
            </h2>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {classData.teacherId?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {classData.teacherId?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {classData.teacherId?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Students ({classData.students?.length || 0})
              </h2>
              {isOwner && (
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                  Manage Students
                </button>
              )}
            </div>

            {classData.students?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No students have joined this class yet.
              </p>
            ) : (
              <div className="space-y-3">
                {classData.students?.map((student, index) => (
                  <div
                    key={student._id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {student.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <button className="text-gray-400 hover:text-gray-600">
                        ⋮
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Class Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Class Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Students</span>
                <span className="font-semibold">
                  {classData.students?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-semibold">
                  {new Date(classData.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-semibold">
                  {new Date(classData.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {isTeacher ? (
                <>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                    Create Assignment
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm">
                    Take Attendance
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm">
                    Share Class Code
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                    View Assignments
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm">
                    Check Attendance
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm">
                    View Grades
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
