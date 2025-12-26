import {useState, useEffect} from "react";

import {useAuth} from "../hooks/useAuth";
import {LoadingSpinner, Alert} from "../components/shared";
import {classAPI, meetingAPI} from "../services/api";

const Meetings = () => {
  const {user} = useAuth();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassMeetings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      live: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[status]}`}>
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
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
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

        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              📹 Upcoming Meetings
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMeetings.slice(0, 3).map((meeting) => (
                <div
                  key={meeting._id}
                  className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 border border-blue-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium">{meeting.title}</h3>
                    {getStatusBadge(meeting.status)}
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    {meeting.classId?.className} - {meeting.classId?.subject}
                  </p>
                  <p className="text-gray-400 text-sm mb-3">
                    📅 {new Date(meeting.scheduledAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleJoinMeeting(meeting)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {meeting.status === "live" ? "Join Now" : "Open Link"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Class Meetings */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">📹 Meetings</h1>
          <div className="flex gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} - {cls.subject}
                </option>
              ))}
            </select>
            {isTeacher && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Schedule Meeting
              </button>
            )}
          </div>
        </div>

        {meetings.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">
              No meetings scheduled for this class
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {meeting.title}
                      </h3>
                      {getStatusBadge(meeting.status)}
                    </div>
                    {meeting.description && (
                      <p className="text-gray-400 text-sm mb-2">
                        {meeting.description}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>
                        📅 {new Date(meeting.scheduledAt).toLocaleString()}
                      </span>
                      <span>⏱️ {meeting.duration} min</span>
                      {meeting.attendees?.length > 0 && (
                        <span>
                          👥{" "}
                          {meeting.attendees.filter((a) => a.attended).length}{" "}
                          attended
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {meeting.status !== "completed" &&
                      meeting.status !== "cancelled" && (
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          {meeting.status === "live" ? "Join" : "Open"}
                        </button>
                      )}
                    {isTeacher && meeting.status === "scheduled" && (
                      <button
                        onClick={() => handleUpdateStatus(meeting._id, "live")}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Start
                      </button>
                    )}
                    {isTeacher && meeting.status === "live" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(meeting._id, "completed")
                        }
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500"
                      >
                        End
                      </button>
                    )}
                    {isTeacher && (
                      <button
                        onClick={() => handleDelete(meeting._id)}
                        className="px-3 py-1 bg-red-800 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateMeetingModal
            classId={selectedClass}
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

const CreateMeetingModal = ({classId, onClose, onSuccess}) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-white mb-4">Schedule Meeting</h2>
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Meeting Link *
            </label>
            <input
              type="url"
              name="meetLink"
              value={formData.meetLink}
              onChange={handleChange}
              placeholder="https://meet.google.com/..."
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Platform
              </label>
              <select
                name="meetingType"
                value={formData.meetingType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="google_meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min={15}
                max={480}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Scheduled Time *
            </label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Meetings;
