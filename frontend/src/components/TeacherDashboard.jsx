import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";

export default function TeacherDashboard() {
  const [teacherName, setTeacherName] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is actually a teacher
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "teacher") {
      navigate("/");
      return;
    }

    // Get teacher name from localStorage or set default
    const savedName = localStorage.getItem("teacherName");
    if (savedName) {
      setTeacherName(savedName);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("teacherName");
    navigate("/");
  };

  const stats = [
    {label: "Total Students", value: "156", icon: "👥", color: "bg-blue-500"},
    {label: "Active Classes", value: "8", icon: "📚", color: "bg-green-500"},
    {label: "Assignments", value: "24", icon: "📝", color: "bg-purple-500"},
    {label: "Avg. Grade", value: "87%", icon: "📊", color: "bg-orange-500"},
  ];

  const recentActivities = [
    {
      action: "New assignment submitted",
      student: "John Doe",
      time: "2 hours ago",
      class: "Math 101",
    },
    {
      action: "Quiz completed",
      student: "Jane Smith",
      time: "4 hours ago",
      class: "Science 201",
    },
    {
      action: "Late submission",
      student: "Mike Johnson",
      time: "1 day ago",
      class: "History 301",
    },
    {
      action: "Perfect score achieved",
      student: "Sarah Wilson",
      time: "2 days ago",
      class: "English 101",
    },
  ];

  const upcomingClasses = [
    {
      subject: "Mathematics 101",
      time: "9:00 AM",
      students: 28,
      room: "Room 204",
    },
    {subject: "Science 201", time: "11:00 AM", students: 24, room: "Lab 3"},
    {subject: "History 301", time: "2:00 PM", students: 32, room: "Room 105"},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">EduHelper</h1>
              <span className="text-sm text-gray-500">Teacher Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {teacherName || "Teacher"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              {id: "overview", label: "Overview", icon: "📊"},
              {id: "classes", label: "My Classes", icon: "📚"},
              {id: "students", label: "Students", icon: "👥"},
              {id: "assignments", label: "Assignments", icon: "📝"},
              {id: "grades", label: "Grades", icon: "🎯"},
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`${stat.color} p-3 rounded-lg text-white text-2xl`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Classes */}
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Today's Classes
                </h3>
                <div className="space-y-4">
                  {upcomingClasses.map((classItem, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {classItem.subject}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {classItem.room} • {classItem.students} students
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-600">
                          {classItem.time}
                        </p>
                        <button className="text-sm text-blue-500 hover:text-blue-700">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activities
                </h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.student} • {activity.class}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content placeholders */}
        {activeTab !== "overview" && (
          <div className="bg-white rounded-xl shadow-sm p-8 border text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
            </h3>
            <p className="text-gray-600">
              This section is under development. Coming soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
