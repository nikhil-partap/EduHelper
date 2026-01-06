import {useState, useEffect} from "react";
import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../hooks/useTheme";
import {useNavigate} from "react-router-dom";
import {
  classAPI,
  quizAPI,
  assignmentAPI,
  meetingAPI,
  portfolioAPI,
  announcementAPI,
  classworkAPI,
} from "../../services/api";

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
    overallGrade: 0,
    attendance: 0,
  });
  const [classes, setClasses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [classworkData, setClassworkData] = useState([]);
  const [peopleData, setPeopleData] = useState([]);
  const [dashboardTab, setDashboardTab] = useState("stream");
  const [isLoading, setIsLoading] = useState(true);

  // Announcement form state
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementContent, setAnnouncementContent] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  const isTeacher = user?.role === "teacher";

  useEffect(() => {
    if (isTeacher) {
      fetchTeacherDashboard();
    } else {
      fetchStudentDashboard();
    }
  }, [user]);

  // Single API call for student dashboard
  const fetchStudentDashboard = async () => {
    try {
      const [dashboardRes, announcementsRes] = await Promise.all([
        portfolioAPI.getStudentDashboard(),
        announcementAPI.getRecentAnnouncements(5),
      ]);
      const data = dashboardRes.data.data;

      setStats({
        classes: data.stats.classes,
        assignments: data.stats.pendingAssignments,
        overallGrade: data.stats.overallGrade,
        attendance: data.stats.attendance,
      });
      setClasses(data.classes);
      setRecentActivity(data.recentActivity);
      setAnnouncements(announcementsRes.data.data || []);

      // Fetch classwork and people from first class if available
      if (data.classes?.length > 0) {
        try {
          const [classworkRes, peopleRes] = await Promise.all([
            classworkAPI.getClasswork(data.classes[0].id),
            classworkAPI.getClassPeople(data.classes[0].id),
          ]);

          // Extract items from classwork sections
          const items = [];
          classworkRes.data.data?.sections?.forEach((section) => {
            section.items?.forEach((item) => {
              items.push({...item, className: data.classes[0].name});
            });
          });
          setClassworkData(items.slice(0, 5));

          // Combine teacher and students
          const people = [];
          if (peopleRes.data.data?.teacher) {
            people.push({
              ...peopleRes.data.data.teacher,
              role: "teacher",
              className: data.classes[0].name,
            });
          }
          peopleRes.data.data?.students?.forEach((s) => {
            people.push({
              ...s,
              role: "student",
              className: data.classes[0].name,
            });
          });
          setPeopleData(people.slice(0, 10));
        } catch {
          // Silently handle errors for classwork/people
        }
      }
    } catch {
      // Keep default stats on error
    } finally {
      setIsLoading(false);
    }
  };

  // Teacher dashboard - multiple API calls (can be optimized later)
  const fetchTeacherDashboard = async () => {
    try {
      const [classResponse, announcementsRes] = await Promise.all([
        classAPI.getTeacherClasses(),
        announcementAPI.getRecentAnnouncements(5),
      ]);
      const classesData = classResponse.data.data || [];
      setAnnouncements(announcementsRes.data.data || []);

      let quizCount = 0;
      let assignmentCount = 0;
      let meetingCount = 0;
      const activities = [];
      let quizzes = [];
      let assignments = [];

      if (classesData.length > 0) {
        const classId = classesData[0]._id;
        try {
          const [quizRes, assignRes, meetRes, classworkRes, peopleRes] =
            await Promise.all([
              quizAPI.getClassQuizzes(classId),
              assignmentAPI.getClassAssignments(classId),
              meetingAPI.getUpcomingMeetings(),
              classworkAPI.getClasswork(classId),
              classworkAPI.getClassPeople(classId),
            ]);

          quizzes = quizRes.data.data || [];
          assignments = assignRes.data.data || [];
          quizCount = quizzes.length;
          assignmentCount = assignments.length;
          meetingCount = meetRes.data.data?.length || 0;

          if (quizzes.length > 0) {
            activities.push({
              type: "quiz",
              title: quizzes[0].topic,
              time: "Recent quiz",
              icon: "📝",
            });
          }
          if (assignments.length > 0) {
            activities.push({
              type: "assignment",
              title: assignments[0].title,
              time: `Due: ${new Date(
                assignments[0].dueDate
              ).toLocaleDateString()}`,
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

          // Build classwork items
          const items = [];
          quizzes.forEach((q) => {
            items.push({
              ...q,
              type: "quiz",
              className: classesData[0].className,
            });
          });
          assignments.forEach((a) => {
            items.push({
              ...a,
              type: "assignment",
              className: classesData[0].className,
            });
          });
          setClassworkData(items.slice(0, 5));

          // Get students
          const people = [];
          peopleRes.data.data?.students?.forEach((s) => {
            people.push({
              ...s,
              role: "student",
              className: classesData[0].className,
            });
          });
          setPeopleData(people.slice(0, 10));
        } catch {
          // Silently handle errors
        }
      }

      setStats({
        classes: classesData.length,
        quizzes: quizCount,
        assignments: assignmentCount,
        meetings: meetingCount,
      });
      setClasses(
        classesData.slice(0, 3).map((c) => ({
          id: c._id,
          name: c.className,
          subject: c.subject,
          studentCount: c.students?.length || 0,
          code: c.joinCode,
        }))
      );
      setRecentActivity(activities);
    } catch {
      // Keep default stats
    } finally {
      setIsLoading(false);
    }
  };

  // Post announcement handler
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementContent.trim() || !selectedClassId) return;

    setIsPostingAnnouncement(true);
    try {
      const response = await announcementAPI.postAnnouncement({
        classId: selectedClassId,
        content: announcementContent.trim(),
        type: "announcement",
      });

      // Add new announcement to the top of the list
      if (response.data.data) {
        setAnnouncements((prev) => [response.data.data, ...prev]);
      }

      // Reset form
      setAnnouncementContent("");
      setShowAnnouncementForm(false);
    } catch (error) {
      console.error("Failed to post announcement:", error);
      alert(error.response?.data?.message || "Failed to post announcement");
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

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
            value={
              isTeacher
                ? classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)
                : `${stats.overallGrade}%`
            }
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
            value={isTeacher ? stats.assignments : `${stats.attendance}%`}
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
              ) : classes.length > 0 ? (
                classes.map((cls) => (
                  <ClassItem
                    key={cls.id}
                    name={cls.name}
                    subtitle={
                      isTeacher
                        ? `${cls.studentCount} students`
                        : cls.teacher || cls.subject
                    }
                    badge={isTeacher ? cls.code : "Active"}
                    onClick={() => navigate(`/class/${cls.id}`)}
                  />
                ))
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
                    time={activity.subtitle || activity.time}
                  />
                ))
              ) : (
                <div
                  className={`text-center py-8 ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Announcements Section with Tabs */}
        <div
          className={`mt-6 rounded-xl border overflow-hidden ${
            isDark ? "bg-card border-border" : "bg-white border-gray-200"
          }`}
        >
          {/* Tab Header */}
          <div
            className={`border-b ${
              isDark ? "border-border" : "border-gray-200"
            }`}
          >
            <div className="flex">
              {[
                {id: "stream", label: "Stream", icon: "📢"},
                {id: "classwork", label: "Classwork", icon: "📚"},
                {id: "people", label: "People", icon: "👥"},
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDashboardTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    dashboardTab === tab.id
                      ? isDark
                        ? "bg-accent text-foreground border-b-2 border-blue-500"
                        : "bg-gray-50 text-gray-900 border-b-2 border-blue-500"
                      : isDark
                      ? "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Stream Tab */}
            {dashboardTab === "stream" && (
              <div className="space-y-3">
                {/* Teacher Announcement Form */}
                {isTeacher && classes.length > 0 && (
                  <div className="mb-4">
                    {!showAnnouncementForm ? (
                      <button
                        onClick={() => {
                          setShowAnnouncementForm(true);
                          if (!selectedClassId && classes.length > 0) {
                            setSelectedClassId(classes[0].id);
                          }
                        }}
                        className={`w-full p-4 rounded-lg border-2 border-dashed text-left transition-colors ${
                          isDark
                            ? "border-border hover:border-blue-500 hover:bg-accent"
                            : "border-gray-300 hover:border-blue-500 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user?.name?.charAt(0) || "T"}
                            </span>
                          </div>
                          <span
                            className={`${
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }`}
                          >
                            Announce something to your class...
                          </span>
                        </div>
                      </button>
                    ) : (
                      <form
                        onSubmit={handlePostAnnouncement}
                        className={`p-4 rounded-lg border ${
                          isDark
                            ? "bg-card border-border"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">
                              {user?.name?.charAt(0) || "T"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <select
                              value={selectedClassId}
                              onChange={(e) =>
                                setSelectedClassId(e.target.value)
                              }
                              className={`w-full mb-2 px-3 py-2 rounded-lg border text-sm ${
                                isDark
                                  ? "bg-secondary border-border text-foreground"
                                  : "bg-gray-50 border-gray-200 text-gray-900"
                              }`}
                            >
                              <option value="">Select a class</option>
                              {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                  {cls.name}
                                </option>
                              ))}
                            </select>
                            <textarea
                              value={announcementContent}
                              onChange={(e) =>
                                setAnnouncementContent(e.target.value)
                              }
                              placeholder="Share an announcement with your class..."
                              rows={3}
                              className={`w-full px-3 py-2 rounded-lg border resize-none text-sm ${
                                isDark
                                  ? "bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                              }`}
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAnnouncementForm(false);
                              setAnnouncementContent("");
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isDark
                                ? "text-muted-foreground hover:bg-accent"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={
                              !announcementContent.trim() ||
                              !selectedClassId ||
                              isPostingAnnouncement
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isDark
                                ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            }`}
                          >
                            {isPostingAnnouncement ? "Posting..." : "Post"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-foreground" : "text-gray-900"
                    }`}
                  >
                    Recent Announcements
                  </h3>
                  {classes.length > 0 && (
                    <button
                      onClick={() => navigate("/announcements")}
                      className={`text-sm ${
                        isDark
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      View All →
                    </button>
                  )}
                </div>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-20 rounded-lg animate-pulse ${
                        isDark ? "bg-muted" : "bg-gray-100"
                      }`}
                    />
                  ))
                ) : announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div
                      key={announcement._id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        isDark
                          ? "border-border hover:bg-accent"
                          : "border-gray-200 hover:bg-gray-50"
                      } ${
                        announcement.isPinned ? "ring-1 ring-yellow-500" : ""
                      }`}
                      onClick={() =>
                        navigate(`/class/${announcement.classId?._id}`)
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">
                            {announcement.teacherId?.name?.charAt(0) || "T"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`font-medium text-sm ${
                                isDark ? "text-foreground" : "text-gray-900"
                              }`}
                            >
                              {announcement.teacherId?.name || "Teacher"}
                            </span>
                            <span
                              className={`text-xs ${
                                isDark
                                  ? "text-muted-foreground"
                                  : "text-gray-500"
                              }`}
                            >
                              • {announcement.classId?.className || "Class"}
                            </span>
                            {announcement.isPinned && (
                              <span className="text-yellow-500 text-xs">
                                📌
                              </span>
                            )}
                          </div>
                          {announcement.title && (
                            <p
                              className={`font-medium text-sm mb-1 ${
                                isDark ? "text-foreground" : "text-gray-900"
                              }`}
                            >
                              {announcement.title}
                            </p>
                          )}
                          <p
                            className={`text-sm line-clamp-2 ${
                              isDark ? "text-muted-foreground" : "text-gray-600"
                            }`}
                          >
                            {announcement.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isDark ? "text-muted-foreground" : "text-gray-400"
                            }`}
                          >
                            {new Date(
                              announcement.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className={`text-center py-8 ${
                      isDark ? "text-muted-foreground" : "text-gray-500"
                    }`}
                  >
                    <p className="text-3xl mb-2">📢</p>
                    <p className="text-sm">No announcements yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Classwork Tab */}
            {dashboardTab === "classwork" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-foreground" : "text-gray-900"
                    }`}
                  >
                    Recent Classwork
                  </h3>
                  {classes.length > 0 && (
                    <button
                      onClick={() => navigate(`/class/${classes[0]?.id}`)}
                      className={`text-sm ${
                        isDark
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      View All →
                    </button>
                  )}
                </div>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-16 rounded-lg animate-pulse ${
                        isDark ? "bg-muted" : "bg-gray-100"
                      }`}
                    />
                  ))
                ) : classworkData.length > 0 ? (
                  classworkData.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        isDark
                          ? "border-border hover:bg-accent"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        navigate(
                          item.type === "quiz"
                            ? `/quiz/${item._id}`
                            : `/assignment/${item._id}`
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.type === "quiz"
                              ? "bg-green-500/20 text-green-500"
                              : item.type === "assignment"
                              ? "bg-purple-500/20 text-purple-500"
                              : "bg-blue-500/20 text-blue-500"
                          }`}
                        >
                          <span className="text-xl">
                            {item.type === "quiz"
                              ? "📝"
                              : item.type === "assignment"
                              ? "📋"
                              : "📁"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium text-sm ${
                              isDark ? "text-foreground" : "text-gray-900"
                            }`}
                          >
                            {item.title || item.topic}
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }`}
                          >
                            {item.className} •{" "}
                            {item.type?.charAt(0).toUpperCase() +
                              item.type?.slice(1)}
                            {item.dueDate &&
                              ` • Due: ${new Date(
                                item.dueDate
                              ).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className={`text-center py-8 ${
                      isDark ? "text-muted-foreground" : "text-gray-500"
                    }`}
                  >
                    <p className="text-3xl mb-2">📚</p>
                    <p className="text-sm">No classwork yet</p>
                  </div>
                )}
              </div>
            )}

            {/* People Tab */}
            {dashboardTab === "people" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-foreground" : "text-gray-900"
                    }`}
                  >
                    {isTeacher ? "Your Students" : "Classmates & Teachers"}
                  </h3>
                </div>
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-14 rounded-lg animate-pulse ${
                        isDark ? "bg-muted" : "bg-gray-100"
                      }`}
                    />
                  ))
                ) : peopleData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {peopleData.map((person, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex items-center gap-3 ${
                          isDark ? "border-border" : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            person.role === "teacher"
                              ? "bg-gradient-to-br from-blue-500 to-purple-600"
                              : "bg-gradient-to-br from-green-500 to-teal-600"
                          }`}
                        >
                          <span className="text-white text-sm font-medium">
                            {person.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm truncate ${
                              isDark ? "text-foreground" : "text-gray-900"
                            }`}
                          >
                            {person.name}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              isDark ? "text-muted-foreground" : "text-gray-500"
                            }`}
                          >
                            {person.role === "teacher"
                              ? "Teacher"
                              : person.rollNumber || person.email}
                            {person.className && ` • ${person.className}`}
                          </p>
                        </div>
                        {person.role === "teacher" && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              isDark
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            👨‍🏫
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`text-center py-8 ${
                      isDark ? "text-muted-foreground" : "text-gray-500"
                    }`}
                  >
                    <p className="text-3xl mb-2">👥</p>
                    <p className="text-sm">No people to show</p>
                  </div>
                )}
              </div>
            )}
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
