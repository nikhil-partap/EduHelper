import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../hooks/useTheme";
import FeatureCard from "./FeatureCard";
import {useNavigate} from "react-router-dom";

const Dashboard = () => {
  const {user} = useAuth();
  const {theme} = useTheme();
  const navigate = useNavigate();

  const isDark = theme === "dark";

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Welcome Section */}
        <div
          className={`overflow-hidden shadow rounded-lg mb-6 transition-colors duration-300 ${
            isDark
              ? "bg-zinc-900 border border-zinc-800"
              : "bg-white border border-gray-200"
          }`}
        >
          <div className="px-4 py-5 sm:p-6">
            <h2
              className={`text-2xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome back, {user?.name}! 👋
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg border transition-colors duration-300 ${
                  isDark
                    ? "bg-zinc-800 border-zinc-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h3 className="font-semibold text-blue-500">Your Profile</h3>
                <p
                  className={`mt-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <strong>Name:</strong> {user?.name}
                </p>
                <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                  <strong>Role:</strong>{" "}
                  <span className="capitalize">{user?.role}</span>
                </p>
                {user?.role === "teacher" && user?.schoolName && (
                  <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                    <strong>School:</strong> {user.schoolName}
                  </p>
                )}
                {user?.role === "student" && user?.rollNumber && (
                  <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                    <strong>Roll Number:</strong> {user.rollNumber}
                  </p>
                )}
              </div>

              <div
                className={`p-4 rounded-lg border transition-colors duration-300 ${
                  isDark
                    ? "bg-zinc-800 border-zinc-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h3 className="font-semibold text-green-500">Quick Actions</h3>
                <div className="mt-3 space-y-2">
                  {user?.role === "teacher" ? (
                    <>
                      <button
                        onClick={() => navigate("/classes")}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          isDark
                            ? "bg-zinc-700 hover:bg-zinc-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        📚 Manage Classes
                      </button>
                      <button
                        onClick={() => navigate("/quiz/generate")}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          isDark
                            ? "bg-zinc-700 hover:bg-zinc-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        🤖 Generate AI Quiz
                      </button>
                      <button
                        onClick={() => navigate("/attendance")}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          isDark
                            ? "bg-zinc-700 hover:bg-zinc-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        ✅ Mark Attendance
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate("/classes")}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          isDark
                            ? "bg-zinc-700 hover:bg-zinc-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        📚 My Classes
                      </button>
                      <button
                        onClick={() => navigate("/quizzes")}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          isDark
                            ? "bg-zinc-700 hover:bg-zinc-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        📝 Take Quizzes
                      </button>
                      <button
                        onClick={() => navigate("/grades")}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          isDark
                            ? "bg-zinc-700 hover:bg-zinc-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        📊 View Grades
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div>
          <h2
            className={`text-2xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {user?.role === "teacher" ? "Teaching Tools" : "Learning Hub"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.role === "teacher" ? (
              <>
                <FeatureCard
                  title="Manage Classes"
                  description="Create and organize your classes, add students, and share join codes."
                  icon="🏫"
                  color="blue"
                  buttonText="Open Classes"
                  disabled={false}
                  onClick={() => navigate("/classes")}
                />
                <FeatureCard
                  title="Attendance"
                  description="Mark attendance, upload CSV, and view attendance statistics."
                  icon="✅"
                  color="green"
                  buttonText="Mark Attendance"
                  disabled={false}
                  onClick={() => navigate("/attendance")}
                />
                <FeatureCard
                  title="Quizzes"
                  description="Generate AI-powered quizzes and view student performance."
                  icon="📝"
                  color="purple"
                  buttonText="Manage Quizzes"
                  disabled={false}
                  onClick={() => navigate("/quizzes")}
                />
                <FeatureCard
                  title="Assignments"
                  description="Create assignments, grade submissions, and track progress."
                  icon="📋"
                  color="orange"
                  buttonText="View Assignments"
                  disabled={false}
                  onClick={() => navigate("/assignments")}
                />
                <FeatureCard
                  title="Grades"
                  description="Add manual grades and view class performance reports."
                  icon="📊"
                  color="blue"
                  buttonText="Grade Book"
                  disabled={false}
                  onClick={() => navigate("/grades")}
                />
                <FeatureCard
                  title="Study Planner"
                  description="Generate AI study plans with chapters, holidays, and exam dates."
                  icon="📅"
                  color="green"
                  buttonText="Create Planner"
                  disabled={false}
                  onClick={() => navigate("/study-planner")}
                />
                <FeatureCard
                  title="Meetings"
                  description="Schedule and manage online class meetings."
                  icon="📹"
                  color="purple"
                  buttonText="Schedule Meeting"
                  disabled={false}
                  onClick={() => navigate("/meetings")}
                />
                <FeatureCard
                  title="Timetable"
                  description="Create and manage your teaching schedule."
                  icon="🗓️"
                  color="orange"
                  buttonText="View Timetable"
                  disabled={false}
                  onClick={() => navigate("/timetable")}
                />
                <FeatureCard
                  title="Reports"
                  description="View detailed student performance reports."
                  icon="📈"
                  color="blue"
                  buttonText="View Reports"
                  disabled={false}
                  onClick={() => navigate("/reports")}
                />
              </>
            ) : (
              <>
                <FeatureCard
                  title="My Classes"
                  description="View your enrolled classes and join new ones with class codes."
                  icon="🎓"
                  color="blue"
                  buttonText="View Classes"
                  disabled={false}
                  onClick={() => navigate("/classes")}
                />
                <FeatureCard
                  title="Quizzes"
                  description="Take quizzes assigned by your teachers and view scores."
                  icon="📝"
                  color="purple"
                  buttonText="Take Quiz"
                  disabled={false}
                  onClick={() => navigate("/quizzes")}
                />
                <FeatureCard
                  title="Assignments"
                  description="View and submit your assignments before the deadline."
                  icon="📋"
                  color="orange"
                  buttonText="View Assignments"
                  disabled={false}
                  onClick={() => navigate("/assignments")}
                />
                <FeatureCard
                  title="My Grades"
                  description="Track your quiz scores and academic performance."
                  icon="📊"
                  color="green"
                  buttonText="View Grades"
                  disabled={false}
                  onClick={() => navigate("/grades")}
                />
                <FeatureCard
                  title="Attendance"
                  description="View your attendance records and statistics."
                  icon="✅"
                  color="blue"
                  buttonText="My Attendance"
                  disabled={false}
                  onClick={() => navigate("/my-attendance")}
                />
                <FeatureCard
                  title="Study Planner"
                  description="View your class study plan and track progress."
                  icon="📅"
                  color="purple"
                  buttonText="View Planner"
                  disabled={false}
                  onClick={() => navigate("/study-planner")}
                />
                <FeatureCard
                  title="Meetings"
                  description="Join scheduled online class meetings."
                  icon="📹"
                  color="orange"
                  buttonText="View Meetings"
                  disabled={false}
                  onClick={() => navigate("/meetings")}
                />
                <FeatureCard
                  title="Timetable"
                  description="View your class schedule and manage your time."
                  icon="🗓️"
                  color="green"
                  buttonText="My Timetable"
                  disabled={false}
                  onClick={() => navigate("/timetable")}
                />
                <FeatureCard
                  title="Schedule"
                  description="View upcoming classes and important dates."
                  icon="📆"
                  color="blue"
                  buttonText="View Schedule"
                  disabled={false}
                  onClick={() => navigate("/schedule")}
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
