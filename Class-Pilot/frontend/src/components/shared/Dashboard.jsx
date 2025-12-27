import {useState, useEffect} from "react";
import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../hooks/useTheme";
import {useNavigate} from "react-router-dom";
import {classAPI, quizAPI, assignmentAPI, meetingAPI} from "../../services/api";

const Dashboard = () => {
  const {user} = useAuth();
  const {theme} = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [stats, setStats] = useState({
    classes: 0,
    quizzes: 0,
    assignments: 0,
    meetings: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const isTeacher = user?.role === "teacher";
      const classResponse = isTeacher
        ? await classAPI.getTeacherClasses()
        : await classAPI.getStudentClasses();

      const classes = classResponse.data.data || [];
      let quizCount = 0;
      let assignmentCount = 0;
      let meetingCount = 0;
      const activities = [];

      if (classes.length > 0) {
        const classId = classes[0]._id;
        try {
          const [quizRes, assignRes, meetRes] = await Promise.all([
            quizAPI.getClassQuizzes(classId),
            assignmentAPI.getClassAssignments(classId),
            meetingAPI.getUpcomingMeetings(),
          ]);

          quizCount = quizRes.data.data?.length || 0;
          assignmentCount = assignRes.data.data?.length || 0;
          meetingCount = meetRes.data.data?.length || 0;

          if (quizRes.data.data?.length > 0) {
            activities.push({
              type: "quiz",
              title: quizRes.data.data[0].topic,
              time: "Recent quiz",
              icon: "📝",
            });
          }
          if (assignRes.data.data?.length > 0) {
            const recent = assignRes.data.data[0];
            activities.push({
              type: "assignment",
              title: recent.title,
              time: `Due: ${new Date(recent.dueDate).toLocaleDateString()}`,
              icon: "📋",
            });
          }
          if (meetRes.data.data?.length > 0) {
            const meeting = meetRes.data.data[0];
            activities.push({
              type: "meeting",
              title: meeting.title,
              time: new Date(meeting.scheduledAt).toLocaleString(),
              icon: "📹",
            });
          }
        } catch {
          // Silently handle errors
        }
      }

      setStats({
        classes: classes.length,
        quizzes: quizCount,
        assignments: assignmentCount,
        meetings: meetingCount,
      });
      setRecentActivity(activities);
    } catch {
      // Keep default stats
    } finally {
      setIsLoading(false);
    }
  };

  const isTeacher = user?.role === "teacher";

  // Stat Card Component - Clean design from Figma
  const StatCard = ({icon, value, label, trend, onClick}) => (
    <button
      onClick={onClick}
      className={`group text-left p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
        isDark
          ? "bg-card border-border hover:border-ring"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-sm font-medium ${
            isDark ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          {label}
        </span>
        <span className="text-lg">{icon}</span>
      </div>
      <div
        className={`text-2xl font-bold ${
          isDark ? "text-foreground" : "text-gray-900"
        }`}
      >
        {isLoading ? (
          <span
            className={`inline-block w-8 h-6 rounded animate-pulse ${
              isDark ? "bg-muted" : "bg-gray-200"
            }`}
          />
        ) : (
          value
        )}
      </div>
      {trend && (
        <p
          className={`text-xs mt-1 ${
            trend.isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend.value}
        </p>
      )}
    </button>
  );

  // Feature Card Component - Figma style with gradient accent
  const FeatureCard = ({
    title,
    description,
    icon,
    gradient,
    buttonText,
    onClick,
  }) => (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg ${
        isDark ? "bg-card border-border" : "bg-white border-gray-200"
      }`}
    >
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="p-6">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}
        >
          <span className="text-white text-xl">{icon}</span>
        </div>
        <h3
          className={`font-semibold mb-1 ${
            isDark ? "text-foreground" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-sm mb-4 ${
            isDark ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          {description}
        </p>
        <button
          onClick={onClick}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            isDark
              ? "bg-white text-gray-900 hover:bg-gray-100"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );

  // Class Item Component
  const ClassItem = ({name, subtitle, badge, onClick}) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
        isDark
          ? "border-border hover:bg-accent"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white">📚</span>
        </div>
        <div className="text-left">
          <p
            className={`font-medium ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            {name}
          </p>
          <p
            className={`text-sm ${
              isDark ? "text-muted-foreground" : "text-gray-500"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>
      {badge && (
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-md ${
            isDark
              ? "bg-secondary text-secondary-foreground"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );

  // Activity Item Component
  const ActivityItem = ({icon, text, time}) => (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isDark ? "bg-primary/10" : "bg-blue-50"
        }`}
      >
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${isDark ? "text-foreground" : "text-gray-900"}`}
        >
          {text}
        </p>
        <p
          className={`text-xs mt-0.5 ${
            isDark ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );

  // Quick Action Button
  const QuickActionBtn = ({icon, label, onClick, variant = "default"}) => (
    <button
      onClick={onClick}
      className={`h-24 flex flex-col items-center justify-center gap-2 rounded-lg border transition-colors ${
        variant === "primary"
          ? isDark
            ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
            : "bg-gray-900 text-white hover:bg-gray-800 border-transparent"
          : isDark
          ? "bg-card border-border hover:bg-accent"
          : "bg-white border-gray-200 hover:bg-gray-50"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const teacherFeatures = [
    {
      title: "Create Quiz",
      description: "Generate AI-powered quizzes",
      icon: "📝",
      gradient: "from-blue-500 to-cyan-500",
      buttonText: "Generate Quiz",
      path: "/quiz/generate",
    },
    {
      title: "Mark Attendance",
      description: "Track student attendance",
      icon: "✅",
      gradient: "from-green-500 to-emerald-500",
      buttonText: "Take Attendance",
      path: "/attendance",
    },
    {
      title: "Create Assignment",
      description: "Add new assignments",
      icon: "📋",
      gradient: "from-purple-500 to-pink-500",
      buttonText: "New Assignment",
      path: "/assignments",
    },
    {
      title: "View Reports",
      description: "Student performance analytics",
      icon: "📊",
      gradient: "from-orange-500 to-red-500",
      buttonText: "View Reports",
      path: "/reports",
    },
  ];

  const studentFeatures = [
    {
      title: "View Portfolio",
      description: "Track your academic progress",
      icon: "📈",
      gradient: "from-blue-500 to-purple-600",
      buttonText: "View Portfolio",
      path: "/portfolio",
    },
    {
      title: "Take Quiz",
      description: "Complete available quizzes",
      icon: "📝",
      gradient: "from-purple-500 to-pink-500",
      buttonText: "Take Quiz",
      path: "/quizzes",
    },
    {
      title: "Assignments",
      description: "View and submit work",
      icon: "📋",
      gradient: "from-orange-500 to-amber-500",
      buttonText: "View Assignments",
      path: "/assignments",
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1
            className={`text-2xl font-semibold ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p
            className={`${isDark ? "text-muted-foreground" : "text-gray-500"}`}
          >
            {isTeacher
              ? "Manage your classes and track student progress"
              : "Track your learning progress"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon="📚"
            value={stats.classes}
            label={isTeacher ? "Total Classes" : "Enrolled Classes"}
            onClick={() => navigate("/classes")}
          />
          <StatCard
            icon={isTeacher ? "👥" : "🏆"}
            value={isTeacher ? stats.classes * 15 : "87.5%"}
            label={isTeacher ? "Total Students" : "Overall Grade"}
            trend={
              isTeacher
                ? {value: "+12% from last month", isPositive: true}
                : null
            }
            onClick={() => navigate(isTeacher ? "/classes" : "/portfolio")}
          />
          <StatCard
            icon="📝"
            value={isTeacher ? stats.quizzes : stats.assignments}
            label={isTeacher ? "Active Quizzes" : "Pending Assignments"}
            onClick={() => navigate(isTeacher ? "/quizzes" : "/assignments")}
          />
          <StatCard
            icon={isTeacher ? "📋" : "📅"}
            value={isTeacher ? stats.assignments : "92%"}
            label={isTeacher ? "Pending Submissions" : "Attendance"}
            onClick={() =>
              navigate(isTeacher ? "/assignments" : "/my-attendance")
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2
            className={`text-lg font-semibold mb-4 ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(isTeacher ? teacherFeatures : studentFeatures).map(
              (feature, idx) => (
                <FeatureCard
                  key={idx}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  gradient={feature.gradient}
                  buttonText={feature.buttonText}
                  onClick={() => navigate(feature.path)}
                />
              )
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Classes */}
          <div
            className={`rounded-xl border p-6 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`font-semibold mb-4 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              My Classes
            </h3>
            <div className="space-y-3">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-16 rounded-lg animate-pulse ${
                      isDark ? "bg-muted" : "bg-gray-100"
                    }`}
                  />
                ))
              ) : stats.classes > 0 ? (
                <>
                  <ClassItem
                    name="Mathematics 101"
                    subtitle={isTeacher ? "32 students" : "Prof. John Doe"}
                    badge={isTeacher ? "MATH101" : "Active"}
                    onClick={() => navigate("/classes")}
                  />
                  <ClassItem
                    name="Physics Advanced"
                    subtitle={isTeacher ? "28 students" : "Prof. Jane Smith"}
                    badge={isTeacher ? "PHY201" : "Active"}
                    onClick={() => navigate("/classes")}
                  />
                  <ClassItem
                    name="Chemistry Basics"
                    subtitle={isTeacher ? "35 students" : "Prof. Bob Wilson"}
                    badge={isTeacher ? "CHEM101" : "Active"}
                    onClick={() => navigate("/classes")}
                  />
                </>
              ) : (
                <div
                  className={`text-center py-8 ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  <p className="text-3xl mb-2">📚</p>
                  <p className="text-sm">No classes yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className={`rounded-xl border p-6 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`font-semibold mb-4 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Recent Activity
            </h3>
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-12 rounded-lg animate-pulse ${
                      isDark ? "bg-muted" : "bg-gray-100"
                    }`}
                  />
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <ActivityItem
                    key={idx}
                    icon={activity.icon}
                    text={activity.title}
                    time={activity.time}
                  />
                ))
              ) : (
                <>
                  <ActivityItem
                    icon="📝"
                    text="New quiz submission from Alice Johnson"
                    time="5 min ago"
                  />
                  <ActivityItem
                    icon="📋"
                    text="Bob Smith submitted assignment"
                    time="15 min ago"
                  />
                  <ActivityItem
                    icon="👤"
                    text="Carol Williams joined Mathematics 101"
                    time="1 hour ago"
                  />
                  <ActivityItem
                    icon="✅"
                    text="Attendance marked for Physics Advanced"
                    time="2 hours ago"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Student Quick Actions */}
        {!isTeacher && (
          <div
            className={`mt-6 rounded-xl border p-6 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`font-semibold mb-4 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickActionBtn
                icon="📈"
                label="View Portfolio"
                onClick={() => navigate("/portfolio")}
                variant="primary"
              />
              <QuickActionBtn
                icon="📝"
                label="Take Quiz"
                onClick={() => navigate("/quizzes")}
              />
              <QuickActionBtn
                icon="📋"
                label="Submit Assignment"
                onClick={() => navigate("/assignments")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
