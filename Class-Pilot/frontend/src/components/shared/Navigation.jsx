import {useState, useRef, useEffect} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../hooks/useTheme";

const Navigation = () => {
  const {user, logout, isAuthenticated} = useAuth();
  const {theme, toggleTheme} = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const isDark = theme === "dark";
  const isTeacher = user?.role === "teacher";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't show navigation on login/register pages
  if (
    !isAuthenticated &&
    (location.pathname === "/login" || location.pathname === "/register")
  ) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Navigation items based on role
  const teacherMenuItems = [
    {id: "dashboard", label: "Dashboard", href: "/dashboard"},
    {id: "classes", label: "My Classes", href: "/classes"},
    {id: "attendance", label: "Attendance", href: "/attendance"},
    {id: "quizzes", label: "Quizzes", href: "/quizzes"},
    {id: "assignments", label: "Assignments", href: "/assignments"},
    {id: "grades", label: "Grades", href: "/grades"},
    {id: "study-planner", label: "Study Planner", href: "/study-planner"},
    {id: "meetings", label: "Meetings", href: "/meetings"},
    {id: "timetable", label: "Timetable", href: "/timetable"},
    {id: "reports", label: "Reports", href: "/reports"},
  ];

  const studentMenuItems = [
    {id: "dashboard", label: "Dashboard", href: "/dashboard"},
    {id: "classes", label: "My Classes", href: "/classes"},
    {id: "take-quiz", label: "Take Quiz", href: "/quizzes"},
    {id: "assignments", label: "Assignments", href: "/assignments"},
    {id: "portfolio", label: "Portfolio", href: "/portfolio"},
    {id: "grades", label: "My Grades", href: "/grades"},
    {id: "attendance", label: "My Attendance", href: "/my-attendance"},
    {id: "study-planner", label: "Study Planner", href: "/study-planner"},
    {id: "meetings", label: "Meetings", href: "/meetings"},
    {id: "timetable", label: "Timetable", href: "/timetable"},
  ];

  const menuItems = isTeacher ? teacherMenuItems : studentMenuItems;

  const isActiveRoute = (href) => location.pathname === href;

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b ${
        isDark ? "bg-card border-border" : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🎓</span>
            </div>
            <div>
              <h1
                className={`font-semibold ${
                  isDark ? "text-foreground" : "text-gray-900"
                }`}
              >
                Class Pilot
              </h1>
              <p
                className={`text-xs capitalize ${
                  isDark ? "text-muted-foreground" : "text-gray-500"
                }`}
              >
                {user?.role}
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(item.href)
                    ? isDark
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-gray-100 text-gray-900"
                    : isDark
                    ? "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-md border transition-colors ${
                isDark
                  ? "bg-background border-input hover:bg-accent"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? (
                <span className="text-yellow-400">☀️</span>
              ) : (
                <span>🌙</span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative h-10 w-10 rounded-full overflow-hidden"
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {getInitials(user?.name)}
                </div>
              </button>

              {isProfileOpen && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-md border shadow-lg py-1 ${
                    isDark
                      ? "bg-popover border-border"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div
                    className={`px-4 py-3 border-b ${
                      isDark ? "border-border" : "border-gray-100"
                    }`}
                  >
                    <p
                      className={`font-medium ${
                        isDark ? "text-foreground" : "text-gray-900"
                      }`}
                    >
                      {user?.name}
                    </p>
                    <p
                      className={`text-xs capitalize ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      {user?.role}
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`sm:hidden w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      isDark
                        ? "text-foreground hover:bg-accent"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {isDark ? "☀️" : "🌙"}
                    <span>Toggle Theme</span>
                  </button>
                  <div
                    className={`border-t ${
                      isDark ? "border-border" : "border-gray-100"
                    }`}
                  >
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        isDark
                          ? "text-foreground hover:bg-accent"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      🚪
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden flex items-center justify-center w-9 h-9 rounded-md border transition-colors ${
                isDark
                  ? "bg-background border-input hover:bg-accent"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`md:hidden pb-3 flex gap-2 overflow-x-auto ${
              isDark ? "border-t border-border" : "border-t border-gray-100"
            }`}
          >
            <div className="flex gap-2 py-3">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute(item.href)
                      ? isDark
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-gray-100 text-gray-900"
                      : isDark
                      ? "text-muted-foreground hover:bg-accent"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
