import {useState, useEffect} from "react";
import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {LoadingSpinner, Alert} from "../components/shared";
import {classAPI, meetingAPI} from "../services/api";

const Meetings = () => {
  const {user} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const isTeacher = user?.role === "teacher";

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassMeetings();
    }
  }, [selectedClass]);

  const fetchData = async () => {
    try {
      const [classesRes, upcomingRes] = await Promise.all([
        isTeacher ? classAPI.getTeacherClasses() : classAPI.getStudentClasses(),
        meetingAPI.getUpcomingMeetings(),
      ]);
      setClasses(classesRes.data.classes || []);
      setUpcomingMeetings(upcomingRes.data.meetings || []);
      if (classesRes.data.classes?.length > 0) {
        setSelectedClass(classesRes.data.classes[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassMeetings = async () => {
    try {
      const response = await meetingAPI.getClassMeetings(selectedClass);
      setMeetings(response.data.meetings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch meetings");
    }
  };

  const handleJoinMeeting = async (meeting) => {
    try {
      if (!isTeacher) {
        await meetingAPI.joinMeeting(meeting._id);
      }
      window.open(meeting.meetLink, "_blank");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join meeting");
    }
  };

  const handleUpdateStatus = async (meetingId, status) => {
    try {
      await meetingAPI.updateMeetingStatus(meetingId, status);
      setSuccess(`Meeting ${status}`);
      fetchClassMeetings();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update meeting");
    }
  };

  const handleDelete = async (meetingId) => {
    if (!confirm("Delete this meeting?")) return;
    try {
      await meetingAPI.deleteMeeting(meetingId);
      setSuccess("Meeting deleted");
      fetchClassMeetings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete meeting");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: "bg-blue-100 text-blue-800",
      live: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-md ${styles[status]}`}
      >
        {status === "live" ? "🔴 LIVE" : status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className={`text-2xl font-semibold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Meetings
            </h1>
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              {isTeacher
                ? "Schedule and manage virtual meetings"
                : "View and join scheduled meetings"}
            </p>
          </div>
          {isTeacher && (
            <button
              onClick={() => setShowCreateModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isDark
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              <span>+</span>
              Schedule Meeting
            </button>
          )}
        </div>

        {/* Class Selector */}
        <div
          className={`rounded-xl border p-4 mb-6 ${
            isDark ? "bg-card border-border" : "bg-white border-gray-200"
          }`}
        >
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={`w-full md:w-auto px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? "bg-input-background border-border text-foreground"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className} - {cls.subject}
              </option>
            ))}
          </select>
        </div>

        {/* Meeting Cards */}
        {meetings.length === 0 ? (
          <div
            className={`rounded-xl border p-12 text-center ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <div className="text-6xl mb-4">📹</div>
            <h3
              className={`text-lg font-medium mb-2 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              No Meetings Scheduled
            </h3>
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              {isTeacher
                ? "Schedule a meeting to get started"
                : "No meetings scheduled for this class"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className={`rounded-xl border overflow-hidden ${
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">📹</span>
                      <h3
                        className={`font-semibold ${
                          isDark ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        {meeting.title}
                      </h3>
                    </div>
                    {getStatusBadge(meeting.status)}
                  </div>

                  {meeting.description && (
                    <p
                      className={`text-sm mb-4 ${
                        isDark ? "text-muted-foreground" : "text-gray-600"
                      }`}
                    >
                      {meeting.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          isDark ? "text-muted-foreground" : "text-gray-400"
                        }
                      >
                        📅
                      </span>
                      <span
                        className={isDark ? "text-foreground" : "text-gray-700"}
                      >
                        {new Date(meeting.scheduledAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          isDark ? "text-muted-foreground" : "text-gray-400"
                        }
                      >
                        ⏱
                      </span>
                      <span
                        className={isDark ? "text-foreground" : "text-gray-700"}
                      >
                        {new Date(meeting.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ({meeting.duration} min)
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isTeacher && (
                      <button
                        onClick={() => handleDelete(meeting._id)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium border transition-colors ${
                          isDark
                            ? "border-border text-foreground hover:bg-accent"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {meeting.status === "scheduled" ? "Edit" : "Delete"}
                      </button>
                    )}
                    {meeting.status !== "completed" &&
                      meeting.status !== "cancelled" && (
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            isDark
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                          }`}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <span>🔗</span>
                            {meeting.status === "live" ? "Join Now" : "Join"}
                          </span>
                        </button>
                      )}
                  </div>

                  {isTeacher && meeting.status === "scheduled" && (
                    <button
                      onClick={() => handleUpdateStatus(meeting._id, "live")}
                      className="w-full mt-2 py-2 px-4 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Start Meeting
                    </button>
                  )}
                  {isTeacher && meeting.status === "live" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(meeting._id, "completed")
                      }
                      className={`w-full mt-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        isDark
                          ? "bg-secondary text-secondary-foreground hover:bg-accent"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      End Meeting
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateMeetingModal
            classId={selectedClass}
            isDark={isDark}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              setSuccess("Meeting scheduled successfully");
              fetchClassMeetings();
              fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
};

const CreateMeetingModal = ({classId, isDark, onClose, onSuccess}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meetLink: "",
    meetingType: "google_meet",
    scheduledAt: "",
    duration: 60,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await meetingAPI.createMeeting({...formData, classId});
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? "bg-input-background border-border text-foreground"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${
    isDark ? "text-foreground" : "text-gray-700"
  }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`rounded-xl p-6 w-full max-w-lg ${
          isDark ? "bg-card border border-border" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            isDark ? "text-foreground" : "text-gray-900"
          }`}
        >
          Schedule New Meeting
        </h2>
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Meeting Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Parent-Teacher Conference"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date *</label>
              <input
                type="date"
                name="date"
                onChange={(e) => {
                  const time = formData.scheduledAt
                    ? formData.scheduledAt.split("T")[1]
                    : "09:00";
                  setFormData((prev) => ({
                    ...prev,
                    scheduledAt: `${e.target.value}T${time}`,
                  }));
                }}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Time *</label>
              <input
                type="time"
                name="time"
                onChange={(e) => {
                  const date = formData.scheduledAt
                    ? formData.scheduledAt.split("T")[0]
                    : new Date().toISOString().split("T")[0];
                  setFormData((prev) => ({
                    ...prev,
                    scheduledAt: `${date}T${e.target.value}`,
                  }));
                }}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min={15}
              max={480}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Meeting Link *</label>
            <input
              type="url"
              name="meetLink"
              value={formData.meetLink}
              onChange={handleChange}
              placeholder="https://meet.example.com/..."
              required
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                isDark
                  ? "bg-secondary text-secondary-foreground hover:bg-accent"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Meetings;
