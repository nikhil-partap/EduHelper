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
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is actually a teacher
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "teacher") {
      navigate("/");
      return;
    }

    // Load teacher data
    loadTeacherData();
  }, [navigate]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);

      // Load dashboard data
      const response = await teacherAPI.getDashboard();

      // Load timetable from backend
      try {
        const timetableResponse = await teacherAPI.getTimetable();
        if (timetableResponse.success && timetableResponse.data) {
          setTimetable(timetableResponse.data);
        }
      } catch (timetableError) {
        console.log("Using default timetable");
      }

      // Set teacher info from localStorage or default
      const teacherName = localStorage.getItem("teacherName") || "Teacher";
      const teacherEmail =
        localStorage.getItem("teacherEmail") || "teacher@eduhelper.com";

      setTeacherData({
        name: teacherName,
        email: teacherEmail,
        classes: response.data?.classes || [],
      });
    } catch (error) {
      console.error("Failed to load teacher data:", error);
      // Use default data if API fails
      const teacherName = localStorage.getItem("teacherName") || "Teacher";
      const teacherEmail =
        localStorage.getItem("teacherEmail") || "teacher@eduhelper.com";

      setTeacherData({
        name: teacherName,
        email: teacherEmail,
        classes: [
          {id: 2, name: "Class 2", students: 25},
          {id: 3, name: "Class 3", students: 28},
          {id: 4, name: "Class 4", students: 22},
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
      // Save timetable to backend
      try {
        await teacherAPI.updateTimetable(timetable);
        console.log("Timetable saved successfully");
      } catch (error) {
        console.error("Failed to save timetable:", error);
        alert("Failed to save timetable. Please try again.");
        return;
      }
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
    // TODO: Navigate to class details page
  };

  const handleStudyPlannerClick = () => {
    console.log("Open study planner");
    // TODO: Navigate to study planner
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header Bar */}
      <div className="bg-white border-b-2 border-gray-300 px-6 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            TeacherDashboard.jsx
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="border-4 border-gray-400 m-4 bg-white min-h-[calc(100vh-100px)]">
        {/* Sidebar */}
        <div className="flex">
          <div className="w-12 bg-gray-200 border-r-2 border-gray-400 min-h-[calc(100vh-100px)]">
            {/* Sidebar content can go here */}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Teacher Info Section */}
            <div className="bg-gray-100 border-2 border-gray-400 rounded p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700 text-sm mb-1">
                    Name of the teacher
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {teacherData.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 text-sm mb-1">
                    Email of the teacher
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {teacherData.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Timetable Section */}
            <div className="bg-white border-2 border-gray-400 rounded-lg p-6 mb-6 min-h-[300px]">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-700 text-center flex-1">
                  This is the timetable of the teacher and the teacher can edit
                  the timetable acc to its needs
                </p>
                <button
                  onClick={handleTimetableEdit}
                  className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  {isEditingTimetable ? "Save" : "Edit"}
                </button>
              </div>

              {/* Timetable Grid */}
              <div className="mt-6">
                <div className="grid grid-cols-6 gap-2">
                  {/* Header */}
                  <div className="font-semibold text-center p-2 bg-gray-200 border border-gray-300">
                    Day
                  </div>
                  <div className="font-semibold text-center p-2 bg-gray-200 border border-gray-300">
                    9:00 AM
                  </div>
                  <div className="font-semibold text-center p-2 bg-gray-200 border border-gray-300">
                    11:00 AM
                  </div>
                  <div className="font-semibold text-center p-2 bg-gray-200 border border-gray-300">
                    1:00 PM
                  </div>
                  <div className="font-semibold text-center p-2 bg-gray-200 border border-gray-300">
                    3:00 PM
                  </div>
                  <div className="font-semibold text-center p-2 bg-gray-200 border border-gray-300">
                    Actions
                  </div>

                  {/* Timetable Rows */}
                  {timetable.map((day, dayIndex) => (
                    <div key={dayIndex} className="contents">
                      <div className="font-medium p-2 bg-gray-50 border border-gray-300 flex items-center">
                        {day.day}
                      </div>
                      {day.slots.map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          className="p-2 border border-gray-300 bg-white"
                        >
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
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">
                              {slot}
                            </span>
                          )}
                        </div>
                      ))}
                      <div className="p-2 border border-gray-300 bg-gray-50 flex items-center justify-center">
                        <button className="text-blue-600 hover:text-blue-800 text-xs">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Study Planner Button */}
            <div className="mb-6">
              <button
                onClick={handleStudyPlannerClick}
                className="bg-white hover:bg-gray-50 border-2 border-gray-400 rounded-full px-6 py-2 text-gray-800 font-medium transition-colors"
              >
                Access the studyplanner
              </button>
            </div>

            {/* Classes Section */}
            <div className="flex gap-4">
              {teacherData.classes.map((classItem) => (
                <button
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem.id)}
                  className="bg-white hover:bg-gray-50 border-2 border-gray-400 rounded px-6 py-3 text-gray-800 font-medium transition-colors"
                >
                  {classItem.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
