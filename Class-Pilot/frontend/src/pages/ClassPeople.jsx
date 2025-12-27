import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useTheme} from "../hooks/useTheme";
import {classworkAPI} from "../services/api";
import {LoadingSpinner, Alert} from "../components/shared";

const ClassPeople = ({classId, isTeacher}) => {
  const {theme} = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [people, setPeople] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPeople();
  }, [classId]);

  const fetchPeople = async () => {
    try {
      setIsLoading(true);
      const response = await classworkAPI.getClassPeople(classId);
      setPeople(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load class members");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = people?.students?.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Teacher Section */}
      <div className="mb-8">
        <h2
          className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDark ? "text-foreground" : "text-gray-900"
          }`}
        >
          <span>👨‍🏫</span> Teacher
        </h2>
        {people?.teacher && (
          <PersonCard
            person={people.teacher}
            role="teacher"
            isDark={isDark}
            isTeacher={isTeacher}
          />
        )}
      </div>

      {/* Students Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-lg font-semibold flex items-center gap-2 ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            <span>👥</span> Students
            <span
              className={`text-sm font-normal px-2 py-0.5 rounded-full ${
                isDark
                  ? "bg-secondary text-muted-foreground"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {people?.totalStudents || 0}
            </span>
          </h2>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search students by name, email, or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg ${
              isDark
                ? "bg-card border-border text-foreground placeholder:text-muted-foreground"
                : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Students Grid */}
        {filteredStudents?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((student) => (
              <PersonCard
                key={student._id}
                person={student}
                role="student"
                isDark={isDark}
                isTeacher={isTeacher}
                onViewPortfolio={() =>
                  navigate(`/portfolio/${student._id}/${classId}`)
                }
                classId={classId}
              />
            ))}
          </div>
        ) : (
          <div
            className={`text-center py-12 rounded-xl border ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <span className="text-4xl mb-4 block">👥</span>
            <p
              className={`${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              {searchQuery
                ? "No students match your search"
                : "No students enrolled yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const PersonCard = ({
  person,
  role,
  isDark,
  isTeacher,
  onViewPortfolio,
  classId,
}) => {
  const navigate = useNavigate();
  const isStudent = role === "student";
  const initials = person.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const gradientColors = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-blue-600",
  ];

  const colorIndex = person.name
    ? person.name.charCodeAt(0) % gradientColors.length
    : 0;

  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark ? "bg-card border-border" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradientColors[colorIndex]} flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-white font-medium">{initials || "?"}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium truncate ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            {person.name}
          </h3>
          <p
            className={`text-sm truncate ${
              isDark ? "text-muted-foreground" : "text-gray-500"
            }`}
          >
            {person.email}
          </p>
          {isStudent && person.rollNumber && (
            <p
              className={`text-sm ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              Roll: {person.rollNumber}
            </p>
          )}
          {!isStudent && person.schoolName && (
            <p
              className={`text-sm ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              {person.schoolName}
            </p>
          )}
        </div>

        {/* Role Badge */}
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isStudent
              ? isDark
                ? "bg-blue-500/20 text-blue-400"
                : "bg-blue-100 text-blue-700"
              : isDark
              ? "bg-purple-500/20 text-purple-400"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {isStudent ? "Student" : "Teacher"}
        </span>
      </div>

      {/* Actions for Teachers viewing Students */}
      {isTeacher && isStudent && (
        <div className="mt-4 pt-4 border-t border-border flex gap-2">
          <button
            onClick={() => navigate(`/portfolio/${person._id}/${classId}`)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
              isDark
                ? "bg-secondary hover:bg-accent text-foreground"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } transition-colors`}
          >
            <span>📊</span> Portfolio
          </button>
          <button
            onClick={() =>
              navigate(`/attendance?student=${person._id}&class=${classId}`)
            }
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
              isDark
                ? "bg-secondary hover:bg-accent text-foreground"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } transition-colors`}
          >
            <span>📅</span> Attendance
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassPeople;
