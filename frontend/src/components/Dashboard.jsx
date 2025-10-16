import {useAuth} from "../context/AuthContext";

const Dashboard = () => {
  const {user, logout} = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Class Pilot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your dashboard!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Your Profile</h3>
                  <p className="text-blue-700 mt-2">
                    <strong>Name:</strong> {user?.name}
                  </p>
                  <p className="text-blue-700">
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p className="text-blue-700">
                    <strong>Role:</strong> {user?.role}
                  </p>
                  {user?.role === "teacher" && user?.schoolName && (
                    <p className="text-blue-700">
                      <strong>School:</strong> {user.schoolName}
                    </p>
                  )}
                  {user?.role === "student" && user?.rollNumber && (
                    <p className="text-blue-700">
                      <strong>Roll Number:</strong> {user.rollNumber}
                    </p>
                  )}
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Quick Stats</h3>
                  <p className="text-green-700 mt-2">
                    Account created successfully!
                  </p>
                  <p className="text-green-700">
                    Ready to start managing your classes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.role === "teacher" ? (
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Manage Classes
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create and organize your classes, add students, and track
                      progress.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Coming Soon
                    </button>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Student Progress
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Monitor student performance and provide feedback.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Coming Soon
                    </button>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Assignments
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create and distribute assignments to your students.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Coming Soon
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      My Classes
                    </h3>
                    <p className="text-gray-600 mb-4">
                      View your enrolled classes and upcoming sessions.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Coming Soon
                    </button>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Assignments
                    </h3>
                    <p className="text-gray-600 mb-4">
                      View and submit your assignments.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Coming Soon
                    </button>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Progress
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Track your learning progress and grades.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Coming Soon
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
