import {useState, useEffect} from "react";
import {useClass} from "../hooks/useClass";
import {useAuth} from "../hooks/useAuth";
import {attendanceAPI, exportAPI, downloadFile} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes.length]);

  // Fetch attendance for selected class
  const fetchAttendance = async (classId) => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getClassAttendance(classId);
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
      const response = await attendanceAPI.getAttendanceStats(classId);
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
      await attendanceAPI.markAttendance({
        classId: selectedClass._id,
        studentId,
        date: selectedDate,
        status,
      });

      setSuccess(`Attendance marked as ${status}`);
      setTimeout(() => setSuccess(null), 2000);

      // Refresh data
      await fetchAttendance(selectedClass._id);
      await fetchStats(selectedClass._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  // Mark all students as present/absent
  const markAllAttendance = async (status) => {
    if (!selectedClass?.students || selectedClass.students.length === 0) return;

    try {
      setLoading(true);
      const promises = selectedClass.students.map((student) =>
        attendanceAPI.markAttendance({
          classId: selectedClass._id,
          studentId: student._id,
          date: selectedDate,
          status,
        })
      );

      await Promise.all(promises);
      setSuccess(`All students marked as ${status}`);
      setTimeout(() => setSuccess(null), 2000);

      // Refresh data
      await fetchAttendance(selectedClass._id);
      await fetchStats(selectedClass._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = user?.role === "teacher";

  // Students should use StudentAttendance component instead
  if (!isTeacher) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          type="info"
          message="This page is for teachers to mark attendance. Students can view their attendance from the navigation menu."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold ">Attendance Management</h1>
        <p className="mt-2 text-gray-400">
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Select Class
        </label>
        <select
          value={selectedClass?._id || ""}
          onChange={(e) => handleClassSelect(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading attendance..." />
            </div>
          ) : (
            <>
              {/* Student List for Marking Attendance */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    Mark Attendance - {selectedDate}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAllAttendance("Present")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => markAllAttendance("Absent")}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Mark All Absent
                    </button>
                  </div>
                </div>

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
                          className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {student.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {student.name}
                              </p>
                              <p className="text-sm text-gray-400">
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
                                  : "bg-zinc-700 text-gray-300 hover:bg-green-600 hover:text-white"
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
                                  : "bg-zinc-700 text-gray-300 hover:bg-red-600 hover:text-white"
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
                  <p className="text-gray-400 text-center py-8">
                    No students enrolled in this class yet.
                  </p>
                )}
              </div>

              {/* Attendance Statistics */}
              {stats.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">
                      Attendance Statistics
                    </h2>
                    <button
                      onClick={async () => {
                        try {
                          const response =
                            await exportAPI.downloadAttendanceExcel(
                              selectedClass._id
                            );
                          downloadFile(
                            response.data,
                            `attendance_${selectedClass.className}.xlsx`
                          );
                          setSuccess("Attendance report downloaded!");
                          setTimeout(() => setSuccess(null), 2000);
                        } catch (err) {
                          setError(
                            err.response?.data?.error ||
                              "Failed to export attendance"
                          );
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      📥 Export Excel
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-800">
                      <thead className="bg-zinc-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
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
                      <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                        {stats.map((stat) => (
                          <tr key={stat.studentId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {stat.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-400">
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
                                <div className="text-sm font-medium text-white">
                                  {stat.percentage}%
                                </div>
                                <div className="ml-2 w-16 bg-zinc-700 rounded-full h-2">
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-white mb-2">
              Select a Class to Begin
            </h3>
            <p className="text-gray-400">
              Choose a class from the dropdown above to start marking attendance
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
