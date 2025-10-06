import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {teacherAPI} from "../utils/api";

export default function TeacherDashboard() {
  const [teacherData, setTeacherData] = useState({
    name: "",
    email: "",
    classes: [],
  });
  const [timetable, setTimetable] = useState([
    {
      day: "Monday",
      slots: ["Math 9:00 AM", "Physics 11:00 AM", "Free", "History 2:00 PM"],
    },
    {
      day: "Tuesday",
      slots: ["Free", "Math 10:00 AM", "Physics 1:00 PM", "Free"],
    },
    {
      day: "Wednesday",
      slots: ["Math 9:00 AM", "Free", "History 12:00 PM", "Physics 3:00 PM"],
    },
    {
      day: "Thursday",
      slots: ["Physics 9:00 AM", "Math 11:00 AM", "Free", "History 2:00 PM"],
    },
    {
      day: "Friday",
      slots: ["Free", "History 10:00 AM", "Math 1:00 PM", "Free"],
    },
  ]);
  const [isEditingTimetable, setIsEditingTimetable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "teacher") {
      navigate("/");
      return;
    }
    loadTeacherData();
  }, [navigate]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getDashboard();

      try {
        const timetableResponse = await teacherAPI.getTimetable();
        if (timetableResponse.success && timetableResponse.data) {
          setTimetable(timetableResponse.data);
        }
      } catch (timetableError) {
        console.log("Using default timetable");
      }

      const teacherName =
        localStorage.getItem("teacherName") || "Dr. Sarah Johnson";
      const teacherEmail =
        localStorage.getItem("teacherEmail") || "sarah.johnson@classpilot.com";

      setTeacherData({
        name: teacherName,
        email: teacherEmail,
        classes: response.data?.classes || [],
      });
    } catch (error) {
      console.error("Failed to load teacher data:", error);
      const teacherName =
        localStorage.getItem("teacherName") || "Dr. Sarah Johnson";
      const teacherEmail =
        localStorage.getItem("teacherEmail") || "sarah.johnson@classpilot.com";

      setTeacherData({
        name: teacherName,
        email: teacherEmail,
        classes: [
          {id: 2, name: "Mathematics 101", students: 25, color: "blue"},
          {id: 3, name: "Physics 201", students: 28, color: "purple"},
          {id: 4, name: "Chemistry 301", students: 22, color: "green"},
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherEmail");
    navigate("/");
  };

  const handleTimetableEdit = async () => {
    if (isEditingTimetable) {
      setSaving(true);
      try {
        await teacherAPI.updateTimetable(timetable);
        console.log("Timetable saved successfully");
      } catch (error) {
        console.error("Failed to save timetable:", error);
        alert("Failed to save timetable. Please try again.");
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    setIsEditingTimetable(!isEditingTimetable);
  };

  const handleSlotChange = (dayIndex, slotIndex, value) => {
    const newTimetable = [...timetable];
    newTimetable[dayIndex].slots[slotIndex] = value;
    setTimetable(newTimetable);
  };

  const handleClassClick = (classId) => {
    console.log("Navigate to class:", classId);
  };

  const handleStudyPlannerClick = () => {
    console.log("Open study planner");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Class Pilot
                </h1>
                <p className="text-sm text-gray-500">Teacher Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Teacher Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                {teacherData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Teacher Name
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {teacherData.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Email Address</p>
              <p className="text-lg font-semibold text-gray-700 flex items-center justify-end space-x-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>{teacherData.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Timetable Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Weekly Timetable
              </h2>
              <p className="text-gray-600">
                Manage your weekly schedule. Click edit to customize your
                timetable according to your needs.
              </p>
            </div>
            <button
              onClick={handleTimetableEdit}
              disabled={saving}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                isEditingTimetable
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : isEditingTimetable ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Edit Timetable</span>
                </>
              )}
            </button>
          </div>

          {/* Timetable Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <th className="px-4 py-3 text-left font-semibold rounded-tl-lg">
                    Day
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    9:00 AM - 10:30 AM
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    11:00 AM - 12:30 PM
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    1:00 PM - 2:30 PM
                  </th>
                  <th className="px-4 py-3 text-center font-semibold rounded-tr-lg">
                    3:00 PM - 4:30 PM
                  </th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((day, dayIndex) => (
                  <tr
                    key={dayIndex}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 font-semibold text-gray-700 bg-gray-50">
                      {day.day}
                    </td>
                    {day.slots.map((slot, slotIndex) => (
                      <td key={slotIndex} className="px-4 py-4">
                        {isEditingTimetable ? (
                          <input
                            type="text"
                            value={slot}
                            onChange={(e) =>
                              handleSlotChange(
                                dayIndex,
                                slotIndex,
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="Enter class or 'Free'"
                          />
                        ) : (
                          <div
                            className={`text-center py-2 px-3 rounded-lg font-medium ${
                              slot.toLowerCase() === "free"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800"
                            }`}
                          >
                            {slot}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Study Planner & Classes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Study Planner Card */}
          <div className="lg:col-span-1">
            <button
              onClick={handleStudyPlannerClick}
              className="w-full bg-gradient-to-br from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white rounded-2xl shadow-lg p-8 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Study Planner</h3>
                  <p className="text-white text-opacity-90">
                    Access your personalized study planner and organize your
                    teaching schedule
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Classes Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your Classes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(teacherData.classes.length > 0
                ? teacherData.classes
                : [
                    {
                      id: 2,
                      name: "Mathematics 101",
                      students: 25,
                      color: "blue",
                    },
                    {id: 3, name: "Physics 201", students: 28, color: "purple"},
                    {
                      id: 4,
                      name: "Chemistry 301",
                      students: 22,
                      color: "green",
                    },
                  ]
              ).map((classItem) => (
                <button
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem.id)}
                  className={`bg-white hover:shadow-xl rounded-xl shadow-md p-6 transition-all duration-200 transform hover:-translate-y-1 border-2 border-transparent hover:border-${
                    classItem.color || "blue"
                  }-300`}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div
                      className={`bg-gradient-to-br from-${
                        classItem.color || "blue"
                      }-400 to-${
                        classItem.color || "blue"
                      }-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-lg`}
                    >
                      {classItem.name.split(" ")[0][0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {classItem.students} Students
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
