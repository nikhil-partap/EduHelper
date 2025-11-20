import {useState, useEffect} from "react";
import {useClass} from "../hooks/useClass";
import {useAuth} from "../hooks/useAuth";
import axios from "axios";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const API_BASE = "http://localhost:5000";

const Attendance = () => {
  const {user} = useAuth();
  const {classes, fetchClasses} = useClass();
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (classes.length === 0) {
      fetchClasses();
    }
  }, [classes.length, fetchClasses]);

  // Fetch attendance for selected class
  const fetchAttendance = async (classId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE}/api/attendance/class?classId=${classId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );

      setAttendanceData(response.data.attendanceByDate || {});
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance stats
  const fetchStats = async (classId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE}/api/attendance/stats?classId=${classId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );

      setStats(response.data.stats || []);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Handle class selection
  const handleClassSelect = async (classId) => {
    const selected = classes.find((c) => c._id === classId);
    setSelectedClass(selected);
    await fetchAttendance(classId);
    await fetchStats(classId);
  };

  // Mark attendance for a student
  const markAttendance = async (studentId, status) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE}/api/attendance/mark`,
        {
          classId: selectedClass._id,
          studentId,
          date: selectedDate,
          status,
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        }
      );

      setSuccess(`Attendance marked as ${status}`);
      setTimeout(() => setSuccess(null), 2000);

      // Refresh data
      await fetchAttendance(selectedClass._id);
      await fetchStats(selectedClass._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  const isTeacher = user?.role === "teacher";

  if (!isTeacher) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          type="info"
          message="Attendance tracking is available for teachers only."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Attendance Management
        </h1>
        <p className="mt-2 text-gray-600">
          Track and manage student attendance for your classes
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Class Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Class
        </label>
        <select
          value={selectedClass?._id || ""}
          onChange={(e) => handleClassSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a class...</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.className} - {cls.subject}
            </option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <>
          {/* Date Selection */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading attendance..." />
            </div>
          ) : (
            <>
              {/* Student List for Marking Attendance */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Mark Attendance - {selectedDate}
                </h2>

                {selectedClass.students && selectedClass.students.length > 0 ? (
                  <div className="space-y-3">
                    {selectedClass.students.map((student) => {
                      const todayAttendance = attendanceData[
                        selectedDate
                      ]?.find(
                        (a) =>
                          a.studentId._id === student._id ||
                          a.studentId === student._id
                      );

                      return (
                        <div
                          key={student._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {student.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {student.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                markAttendance(student._id, "Present")
                              }
                              className={`px-4 py-2 rounded-md font-medium ${
                                todayAttendance?.status === "Present"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-green-100"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() =>
                                markAttendance(student._id, "Absent")
                              }
                              className={`px-4 py-2 rounded-md font-medium ${
                                todayAttendance?.status === "Absent"
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-red-100"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No students enrolled in this class yet.
                  </p>
                )}
              </div>

              {/* Attendance Statistics */}
              {stats.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Attendance Statistics
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Roll Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Present
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Absent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.map((stat) => (
                          <tr key={stat.studentId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {stat.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {stat.rollNumber || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {stat.present}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                {stat.absent}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">
                                  {stat.percentage}%
                                </div>
                                <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      stat.percentage >= 75
                                        ? "bg-green-600"
                                        : stat.percentage >= 50
                                        ? "bg-yellow-600"
                                        : "bg-red-600"
                                    }`}
                                    style={{width: `${stat.percentage}%`}}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {!selectedClass && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Class to Begin
            </h3>
            <p className="text-gray-500">
              Choose a class from the dropdown above to start marking attendance
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
