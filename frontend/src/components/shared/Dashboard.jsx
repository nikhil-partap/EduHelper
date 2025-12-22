import {useAuth} from "../../hooks/useAuth";
import FeatureCard from "./FeatureCard";

const Dashboard = () => {
  const {user} = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {user?.role === "teacher" ? "Teaching Tools" : "Learning Hub"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.role === "teacher" ? (
              <>
                <FeatureCard
                  title="Manage Classes"
                  description="Create and organize your classes, add students, and track progress."
                  icon="🏫"
                  color="blue"
                />
                <FeatureCard
                  title="asdfghjkl"
                  description="Monitor student performance and provide detailed feedback."
                  icon="📊"
                  color="green"
                />
                <FeatureCard
                  title="Assignments"
                  description="Create and distribute assignments to your students."
                  icon="📝"
                  color="purple"
                />
                <FeatureCard
                  title="Grade Book"
                  description="Manage grades and generate progress reports."
                  icon="📋"
                  color="orange"
                />
                <FeatureCard
                  title="Announcement"
                  description="Send announcements and communicate with students."
                  icon="💬"
                  color="blue"
                />
                <FeatureCard
                  title="Resources"
                  description="Upload and share learning materials and resources."
                  icon="📚"
                  color="green"
                />
              </>
            ) : (
              <>
                <FeatureCard
                  title="My Classes"
                  description="View your enrolled classes and upcoming sessions."
                  icon="🎓"
                  color="blue"
                />
                <FeatureCard
                  title="Assignments"
                  description="View and submit your assignments on time."
                  icon="📝"
                  color="purple"
                />
                <FeatureCard
                  title="Progress"
                  description="Track your learning progress and grades."
                  icon="📈"
                  color="green"
                />
                <FeatureCard
                  title="Schedule"
                  description="View your class schedule and important dates."
                  icon="📅"
                  color="orange"
                />
                <FeatureCard
                  title="Resources"
                  description="Access learning materials and course resources."
                  icon="📚"
                  color="blue"
                />
                <FeatureCard
                  title="Messages"
                  description="Communicate with teachers and classmates."
                  icon="💬"
                  color="green"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
