import {useState, useEffect} from "react";

import {useAuth} from "../hooks/useAuth";
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
  const isStudent = user?.role === "student";

  const [timetable, setTimetable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    fetchTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">📅 My Timetable</h1>
          <div className="flex gap-3">
            {isStudent && (
              <button
                onClick={handleAutoPopulate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Auto-fill from Classes
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Slot
            </button>
          </div>
        </div>

        {/* Weekly Grid View */}
        <div className="grid grid-cols-6 gap-4">
          {DAYS.map((day) => (
            <div key={day} className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-700 px-3 py-2 text-center">
                <h3 className="text-white font-medium">{day}</h3>
              </div>
              <div className="p-2 space-y-2 min-h-[400px]">
                {getSlotsByDay(day).length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No classes
                  </p>
                ) : (
                  getSlotsByDay(day).map((slot) => (
                    <div
                      key={slot._id}
                      className="rounded p-2 text-sm cursor-pointer hover:opacity-80"
                      style={{backgroundColor: slot.color || "#3B82F6"}}
                      onClick={() => setEditingSlot(slot)}
                    >
                      <p className="font-medium text-white truncate">
                        {slot.subject}
                      </p>
                      <p className="text-white/80 text-xs">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      {slot.room && (
                        <p className="text-white/70 text-xs truncate">
                          📍 {slot.room}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || editingSlot) && (
          <SlotModal
            slot={editingSlot}
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

const SlotModal = ({slot, onClose, onSuccess, onDelete}) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          {slot ? "Edit Slot" : "Add Slot"}
        </h2>
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Day *</label>
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
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
              <label className="block text-sm text-gray-300 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Room</label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Meet Link
            </label>
            <input
              type="url"
              name="meetLink"
              value={formData.meetLink}
              onChange={handleChange}
              placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Color</label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({...prev, color}))}
                  className={`w-8 h-8 rounded-full ${
                    formData.color === color ? "ring-2 ring-white" : ""
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
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-3">
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
