import {useState, useEffect} from "react";
import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {LoadingSpinner, Alert} from "../components/shared";
import {timetableAPI} from "../services/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
];

const Timetable = () => {
  const {user} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const isStudent = user?.role === "student";

  const [timetable, setTimetable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await timetableAPI.getTimetable();
      setTimetable(response.data.timetable);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch timetable");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoPopulate = async () => {
    try {
      setIsLoading(true);
      const response = await timetableAPI.autoPopulate();
      setTimetable(response.data.timetable);
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to auto-populate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm("Delete this slot?")) return;
    try {
      await timetableAPI.deleteSlot(slotId);
      setSuccess("Slot deleted");
      fetchTimetable();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete slot");
    }
  };

  const getSlotsByDay = (day) => {
    return (timetable?.slots || [])
      .filter((slot) => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
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
              Timetable
            </h1>
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              Your weekly class schedule
            </p>
          </div>
          <div className="flex gap-3">
            {isStudent && (
              <button
                onClick={handleAutoPopulate}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                  isDark
                    ? "border-border text-foreground hover:bg-accent"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Auto-fill from Classes
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isDark
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              + Add Slot
            </button>
          </div>
        </div>

        {/* Weekly Grid View */}
        <div className="grid grid-cols-1 gap-4">
          {DAYS.map((day) => (
            <div
              key={day}
              className={`rounded-xl border overflow-hidden ${
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`px-4 py-3 flex items-center gap-2 border-b ${
                  isDark ? "border-border" : "border-gray-200"
                }`}
              >
                <span className="text-blue-600">📅</span>
                <h3
                  className={`font-semibold ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  {day}
                </h3>
              </div>
              <div className="p-4">
                {getSlotsByDay(day).length === 0 ? (
                  <p
                    className={`text-sm text-center py-4 ${
                      isDark ? "text-muted-foreground" : "text-gray-400"
                    }`}
                  >
                    No classes scheduled
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getSlotsByDay(day).map((slot) => (
                      <div
                        key={slot._id}
                        onClick={() => setEditingSlot(slot)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          isDark
                            ? "border-border hover:bg-accent"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2 h-10 rounded-full"
                            style={{backgroundColor: slot.color || "#3B82F6"}}
                          />
                          <div>
                            <p
                              className={`font-medium ${
                                isDark ? "text-foreground" : "text-gray-900"
                              }`}
                            >
                              {slot.subject}
                            </p>
                            <p
                              className={`text-sm ${
                                isDark
                                  ? "text-muted-foreground"
                                  : "text-gray-500"
                              }`}
                            >
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                        </div>
                        {slot.room && (
                          <span
                            className={`px-2 py-1 text-xs rounded-md ${
                              isDark
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {slot.room}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || editingSlot) && (
          <SlotModal
            slot={editingSlot}
            isDark={isDark}
            onClose={() => {
              setShowAddModal(false);
              setEditingSlot(null);
            }}
            onSuccess={() => {
              setShowAddModal(false);
              setEditingSlot(null);
              setSuccess(editingSlot ? "Slot updated" : "Slot added");
              fetchTimetable();
            }}
            onDelete={
              editingSlot ? () => handleDeleteSlot(editingSlot._id) : null
            }
          />
        )}
      </div>
    </div>
  );
};

const SlotModal = ({slot, isDark, onClose, onSuccess, onDelete}) => {
  const [formData, setFormData] = useState({
    day: slot?.day || "Monday",
    startTime: slot?.startTime || "09:00",
    endTime: slot?.endTime || "10:00",
    subject: slot?.subject || "",
    room: slot?.room || "",
    meetLink: slot?.meetLink || "",
    notes: slot?.notes || "",
    color: slot?.color || COLORS[0],
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
      if (slot) {
        await timetableAPI.updateSlot(slot._id, formData);
      } else {
        await timetableAPI.addSlot(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save slot");
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
        className={`rounded-xl p-6 w-full max-w-md ${
          isDark ? "bg-card border border-border" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            isDark ? "text-foreground" : "text-gray-900"
          }`}
        >
          {slot ? "Edit Slot" : "Add Slot"}
        </h2>
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Day *</label>
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              className={inputClass}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Time *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Room</label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Meet Link</label>
            <input
              type="url"
              name="meetLink"
              value={formData.meetLink}
              onChange={handleChange}
              placeholder="https://meet.google.com/..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Color</label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({...prev, color}))}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : ""
                  }`}
                  style={{backgroundColor: color}}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-3">
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
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Timetable;
