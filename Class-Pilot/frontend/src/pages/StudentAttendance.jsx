import {useState, useEffect} from "react";
import {useClass} from "../hooks/useClass";
import {useAuth} from "../hooks/useAuth";
import {attendanceAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const StudentAttendance = () => {
  const {user} = useAuth();
  const {classes, fetchClasses} = useClass();
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (classes.length === 0) {
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes.length]);

  // Fetch student's attendance for selected class
  const fetchStudentAttendance = async (classId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceAPI.getStudentAttendance(
        classId,
        user.id
      );
      setAttendanceData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  // Handle class selection
  const handleClassSelect = async (classId) => {
    const selected = classes.find((c) => c._id === classId);
    setSelectedClass(selected);
    if (classId) {
      await fetchStudentAttendance(classId);
    } else {
      setAttendanceData(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Attendance</h1>
        <p className="mt-2 text-gray-400">
          View your attendance records and statistics
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Class Selection */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-black mb-2">
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

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading attendance..." />
        </div>
      ) : selectedClass && attendanceData ? (
        <>
          {/* Attendance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Days</p>
                  <p className="text-3xl font-bold text-black mt-1">
                    {attendanceData.total}
                  </p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Present</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">
                    {attendanceData.present}
                  </p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Absent</p>
                  <p className="text-3xl font-bold text-red-400 mt-1">
                    {attendanceData.absent}
                  </p>
                </div>
                <div className="text-4xl">❌</div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Percentage</p>
                  <p
                    className={`text-3xl font-bold mt-1 ${
                      attendanceData.percentage >= 75
                        ? "text-green-400"
                        : attendanceData.percentage >= 50
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {attendanceData.percentage}%
                  </p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>
          </div>

          {/* Attendance Status Indicator */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">
              Attendance Status
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="w-full bg-zinc-700 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      attendanceData.percentage >= 75
                        ? "bg-green-600"
                        : attendanceData.percentage >= 50
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                    style={{width: `${attendanceData.percentage}%`}}
                  ></div>
                </div>
              </div>
              <div className="text-black font-semibold">
                {attendanceData.percentage}%
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              {attendanceData.percentage >= 75 ? (
                <p className="text-green-400">
                  ✅ Great! Your attendance is above 75%. Keep it up!
                </p>
              ) : attendanceData.percentage >= 50 ? (
                <p className="text-yellow-400">
                  ⚠️ Your attendance is below 75%. Try to attend more classes.
                </p>
              ) : (
                <p className="text-red-400">
                  ❌ Warning! Your attendance is critically low. Please improve.
                </p>
              )}
            </div>
          </div>

          {/* Detailed Attendance Records */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-4">
              Attendance Records
            </h2>

            {attendanceData.records && attendanceData.records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-800">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Marked By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                    {attendanceData.records
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-black">
                              {new Date(record.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.status === "Present" ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                ✅ Present
                              </span>
                            ) : (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                ❌ Absent
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-400">
                              {record.markedBy?.name || "Teacher"}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No attendance records found for this class yet.
              </p>
            )}
          </div>
        </>
      ) : (
        !loading &&
        selectedClass && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-white mb-2">
                No Attendance Data
              </h3>
              <p className="text-gray-400">
                No attendance has been recorded for this class yet.
              </p>
            </div>
          </div>
        )
      )}

      {!selectedClass && !loading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-white mb-2">
              Select a Class
            </h3>
            <p className="text-gray-400">
              Choose a class from the dropdown above to view your attendance
              records
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
