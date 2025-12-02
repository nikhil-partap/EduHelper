import {useState, useEffect} from "react";
import {useClass} from "../hooks/useClass";
import {useAuth} from "../hooks/useAuth";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const Schedule = () => {
  const {user} = useAuth();
  const {classes, loading, error, fetchClasses} = useClass();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  useEffect(() => {
    if (classes.length === 0) {
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes.length]);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getClassesForDay = (dayIndex) => {
    // For now, showing all classes as we don't have schedule data
    // In future, filter by actual schedule
    return classes;
  };

  const todayClasses = getClassesForDay(selectedDay);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading schedule..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Class Schedule</h1>
        <p className="mt-2 text-gray-400">
          View your class timetable and upcoming sessions
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Day Selector */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {days.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDay(index)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedDay === index
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
              }`}
            >
              {day}
              {index === new Date().getDay() && (
                <span className="ml-2 text-xs">(Today)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Current Week Overview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Week Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Classes</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {classes.length}
                </p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Today's Classes</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {todayClasses.length}
                </p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Selected Day</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {days[selectedDay]}
                </p>
              </div>
              <div className="text-3xl">🗓️</div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes for Selected Day */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Classes on {days[selectedDay]}
        </h2>

        {todayClasses.length > 0 ? (
          <div className="space-y-4">
            {todayClasses.map((classItem) => (
              <div
                key={classItem._id}
                className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">📖</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {classItem.className}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {classItem.subject} • {classItem.board}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Teacher</p>
                        <p className="text-sm text-white">
                          {user?.role === "teacher"
                            ? user.name
                            : classItem.teacherId?.name || "Loading..."}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Students</p>
                        <p className="text-sm text-white">
                          {classItem.students?.length || 0} enrolled
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Class Code</p>
                        <p className="text-sm font-mono text-blue-400">
                          {classItem.classCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Classes Scheduled
            </h3>
            <p className="text-gray-400">
              You don't have any classes on {days[selectedDay]}.
            </p>
          </div>
        )}
      </div>

      {/* Note about future features */}
      <div className="mt-6 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <p className="text-sm text-blue-300 font-medium">
              Enhanced Schedule Coming Soon
            </p>
            <p className="text-xs text-blue-400 mt-1">
              Future updates will include specific time slots, room numbers, and
              calendar integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
