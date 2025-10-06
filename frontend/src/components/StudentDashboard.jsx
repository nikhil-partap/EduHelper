import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";

export default function StudentDashboard() {
  const [studentName, setStudentName] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is actually a student
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "student") {
      navigate("/");
      return;
    }

    // Get student name from localStorage or set default
    const savedName = localStorage.getItem("studentName");
    if (savedName) {
      setStudentName(savedName);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("studentName");
    navigate("/");
  };

  const stats = [
    {label: "Enrolled Courses", value: "6", icon: "📚", color: "bg-blue-500"},
    {
      label: "Completed Assignments",
      value: "18",
      icon: "✅",
      color: "bg-green-500",
    },
    {label: "Pending Tasks", value: "4", icon: "⏰", color: "bg-orange-500"},
    {label: "Overall GPA", value: "3.8", icon: "🎯", color: "bg-purple-500"},
  ];

  const upcomingAssignments = [
    {
      title: "Math Quiz Chapter 5",
      subject: "Mathematics",
      dueDate: "Tomorrow",
      priority: "high",
    },
    {
      title: "Science Lab Report",
      subject: "Physics",
      dueDate: "Jan 15",
      priority: "medium",
    },
    {
      title: "History Essay",
      subject: "World History",
      dueDate: "Jan 18",
      priority: "low",
    },
    {
      title: "English Presentation",
      subject: "Literature",
      dueDate: "Jan 20",
      priority: "medium",
    },
  ];

  const recentGrades = [
    {
      subject: "Mathematics",
      assignment: "Algebra Test",
      grade: "A-",
      score: "92%",
      date: "Jan 8",
    },
    {
      subject: "Science",
      assignment: "Chemistry Lab",
      grade: "B+",
      score: "87%",
      date: "Jan 6",
    },
    {
      subject: "English",
      assignment: "Essay Writing",
      grade: "A",
      score: "95%",
      date: "Jan 4",
    },
    {
      subject: "History",
      assignment: "Timeline Project",
      grade: "B",
      score: "84%",
      date: "Jan 2",
    },
  ];

  const todaySchedule = [
    {
      subject: "Mathematics",
      time: "9:00 AM - 10:00 AM",
      teacher: "Mr. Johnson",
      room: "Room 204",
    },
    {
      subject: "Physics",
      time: "10:30 AM - 11:30 AM",
      teacher: "Dr. Smith",
      room: "Lab 3",
    },
    {
      subject: "English",
      time: "1:00 PM - 2:00 PM",
      teacher: "Ms. Davis",
      room: "Room 101",
    },
    {
      subject: "History",
      time: "2:30 PM - 3:30 PM",
      teacher: "Mr. Wilson",
      room: "Room 105",
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">EduHelper</h1>
              <span className="text-sm text-gray-500">Student Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {studentName || "Student"}
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
              {id: "courses", label: "My Courses", icon: "📚"},
              {id: "assignments", label: "Assignments", icon: "📝"},
              {id: "grades", label: "Grades", icon: "🎯"},
              {id: "schedule", label: "Schedule", icon: "📅"},
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-purple-100 text-purple-700 border-b-2 border-purple-500"
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
              {/* Today's Schedule */}
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Today's Classes
                </h3>
                <div className="space-y-4">
                  {todaySchedule.map((classItem, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {classItem.subject}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {classItem.teacher} • {classItem.room}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-purple-600">
                          {classItem.time}
                        </p>
                        <button className="text-sm text-purple-500 hover:text-purple-700">
                          Join Class
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Assignments */}
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Upcoming Assignments
                </h3>
                <div className="space-y-4">
                  {upcomingAssignments.map((assignment, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {assignment.subject}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                              assignment.priority
                            )}`}
                          >
                            {assignment.priority.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            Due: {assignment.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Grades
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Subject
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Assignment
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Grade
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGrades.map((grade, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">
                          {grade.subject}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {grade.assignment}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-green-600">
                            {grade.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {grade.score}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {grade.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
