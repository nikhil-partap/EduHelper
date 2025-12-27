import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {classAPI} from "../services/api";
import {LoadingSpinner, Alert} from "../components/shared";
import AnnouncementStream from "./AnnouncementStream";
import Classwork from "./Classwork";
import ClassPeople from "./ClassPeople";

const ClassRoom = () => {
  const {classId} = useParams();
  const {user} = useAuth();
  const {theme} = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const isTeacher = user?.role === "teacher";

  const [activeTab, setActiveTab] = useState("stream");
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setIsLoading(true);
      const response = await classAPI.getClassDetails(classId);
      setClassData(response.data.class || response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load class");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {id: "stream", label: "Stream", icon: "📢"},
    {id: "classwork", label: "Classwork", icon: "📚"},
    {id: "people", label: "People", icon: "👥"},
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="error" message={error} />
        <button
          onClick={() => navigate("/classes")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      {/* Class Header */}
      <div
        className={`border-b ${
          isDark ? "bg-card border-border" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Class Info Banner */}
          <div className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl">📚</span>
              </div>
              <div className="flex-1">
                <h1
                  className={`text-2xl font-bold ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  {classData?.className}
                </h1>
                <p
                  className={`${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  {classData?.subject} • {classData?.board}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {classData?.classCode}
                </span>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  {classData?.students?.length || 0} students
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? isDark
                      ? "bg-background text-foreground border-t border-x border-border"
                      : "bg-gray-50 text-gray-900 border-t border-x border-gray-200"
                    : isDark
                    ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "stream" && (
          <AnnouncementStream
            classId={classId}
            isTeacher={isTeacher}
            classData={classData}
          />
        )}
        {activeTab === "classwork" && (
          <Classwork
            classId={classId}
            isTeacher={isTeacher}
            classData={classData}
          />
        )}
        {activeTab === "people" && (
          <ClassPeople
            classId={classId}
            isTeacher={isTeacher}
            classData={classData}
          />
        )}
      </div>
    </div>
  );
};

export default ClassRoom;
