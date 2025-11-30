import {useState, useEffect} from "react";
import {useAuth} from "../hooks/useAuth";
import {studyPlannerAPI} from "../services/api";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import Alert from "../components/shared/Alert";

const StudyPlanner = () => {
  const {user} = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    startDate: new Date().toISOString().split("T")[0],
    durationDays: 7,
    dailyGoal: "",
    holidays: [],
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await studyPlannerAPI.getMyPlans();
      setPlans(response.data.plans || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch study plans");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const response = await studyPlannerAPI.createPlan(formData);
      setPlans([response.data.plan, ...plans]);
      setSuccess("Study plan created successfully!");
      setShowCreateForm(false);
      setFormData({
        topic: "",
        startDate: new Date().toISOString().split("T")[0],
        durationDays: 7,
        dailyGoal: "",
        holidays: [],
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create study plan");
    }
  };

  const handleUpdateProgress = async (planId, completed) => {
    try {
      await studyPlannerAPI.updateProgress(planId, {completed});
      setPlans(plans.map((p) => (p._id === planId ? {...p, completed} : p)));
      setSuccess("Progress updated!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update progress");
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("Are you sure you want to delete this study plan?")) return;

    try {
      await studyPlannerAPI.deletePlan(planId);
      setPlans(plans.filter((p) => p._id !== planId));
      setSuccess("Study plan deleted");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete plan");
    }
  };

  const calculateProgress = (plan) => {
    return Math.round((plan.completed / plan.durationDays) * 100);
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (user?.role !== "student") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert
          type="info"
          message="Study planner is available for students only."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Study Planner</h1>
          <p className="mt-2 text-gray-400">
            Plan and track your study schedule
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
        >
          Create New Plan
        </button>
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

      {/* Create Plan Form */}
      {showCreateForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Create Study Plan
          </h2>

          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Topic *
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g., Mathematics Final Exam"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Duration (Working Days) *
                </label>
                <input
                  type="number"
                  name="durationDays"
                  value={formData.durationDays}
                  onChange={handleChange}
                  min="1"
                  max="365"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Daily Goal *
                </label>
                <input
                  type="text"
                  name="dailyGoal"
                  value={formData.dailyGoal}
                  onChange={handleChange}
                  placeholder="e.g., Study 2 chapters"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium"
              >
                Create Plan
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 rounded-md font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Study Plans List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading study plans..." />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Study Plans Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first study plan to get started
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Create Study Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const progress = calculateProgress(plan);
            const daysRemaining = getDaysRemaining(plan.endDate);
            const isCompleted = plan.completed >= plan.durationDays;

            return (
              <div
                key={plan._id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg shadow p-6"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {plan.topic}
                  </h3>
                  <p className="text-sm text-gray-400">{plan.dailyGoal}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress:</span>
                    <span className="text-white font-medium">
                      {plan.completed}/{plan.durationDays} days
                    </span>
                  </div>

                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isCompleted ? "bg-green-600" : "bg-blue-600"
                      }`}
                      style={{width: `${Math.min(progress, 100)}%`}}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Days Remaining:</span>
                    <span
                      className={`font-medium ${
                        daysRemaining < 0
                          ? "text-red-400"
                          : daysRemaining < 3
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {daysRemaining < 0 ? "Overdue" : `${daysRemaining} days`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">End Date:</span>
                    <span className="text-gray-300">
                      {new Date(plan.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isCompleted && (
                    <button
                      onClick={() =>
                        handleUpdateProgress(plan._id, plan.completed + 1)
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Mark Day Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>

                {isCompleted && (
                  <div className="mt-3 bg-green-900 border border-green-700 rounded p-2 text-center">
                    <span className="text-green-400 font-medium text-sm">
                      ✓ Completed!
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
