import {useState, useEffect} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../hooks/useTheme";

const Sidebar = () => {
  const {user, logout, isAuthenticated} = useAuth();
  const {theme, toggleTheme} = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDark = theme === "dark";
  const isTeacher = user?.role === "teacher";

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Don't show sidebar on login/register pages
  if (
    !isAuthenticated ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Navigation items with icons
  const teacherMenuItems = [
    {id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "🏠"},
    {id: "classes", label: "My Classes", href: "/classes", icon: "📚"},
    {id: "attendance", label: "Attendance", href: "/attendance", icon: "✅"},
    {id: "quizzes", label: "Quizzes", href: "/quizzes", icon: "📝"},
    {id: "assignments", label: "Assignments", href: "/assignments", icon: "📋"},
    {id: "grades", label: "Grades", href: "/grades", icon: "📊"},
    {
      id: "study-planner",
      label: "Study Planner",
      href: "/study-planner",
      icon: "📅",
    },
    {id: "meetings", label: "Meetings", href: "/meetings", icon: "📹"},
    {id: "timetable", label: "Timetable", href: "/timetable", icon: "🗓️"},
    {id: "reports", label: "Reports", href: "/reports", icon: "📈"},
  ];

  const studentMenuItems = [
    {id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "🏠"},
    {id: "classes", label: "My Classes", href: "/classes", icon: "📚"},
    {id: "take-quiz", label: "Take Quiz", href: "/quizzes", icon: "📝"},
    {id: "assignments", label: "Assignments", href: "/assignments", icon: "📋"},
    {id: "portfolio", label: "Portfolio", href: "/portfolio", icon: "📈"},
    {id: "grades", label: "My Grades", href: "/grades", icon: "📊"},
    {
      id: "attendance",
      label: "My Attendance",
      href: "/my-attendance",
      icon: "✅",
    },
    {
      id: "study-planner",
      label: "Study Planner",
      href: "/study-planner",
      icon: "📅",
    },
    {id: "meetings", label: "Meetings", href: "/meetings", icon: "📹"},
    {id: "timetable", label: "Timetable", href: "/timetable", icon: "🗓️"},
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
    <>
      {/* Mobile Toggle Button - Fixed position */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border shadow-lg transition-colors ${
          isDark
            ? "bg-card border-border text-foreground hover:bg-accent"
            : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
        }`}
      >
        {isMobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ${
          isDark
            ? "bg-card border-r border-border"
            : "bg-white border-r border-gray-200"
        } ${isCollapsed ? "w-20" : "w-64"} ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo & Collapse Button */}
        <div
          className={`flex items-center p-4 border-b ${
            isDark ? "border-border" : "border-gray-200"
          } ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
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
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
              isDark
                ? "hover:bg-accent text-muted-foreground"
                : "hover:bg-gray-100 text-gray-500"
            } ${isCollapsed ? "bg-card border border-border shadow-sm" : ""}`}
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActiveRoute(item.href)
                      ? isDark
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-900 text-white"
                      : isDark
                      ? "text-muted-foreground hover:bg-accent hover:text-foreground"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.label : ""}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section - Theme & Profile */}
        <div
          className={`p-3 border-t ${
            isDark ? "border-border" : "border-gray-200"
          }`}
        >
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-2 ${
              isDark
                ? "text-muted-foreground hover:bg-accent hover:text-foreground"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={
              isCollapsed ? `Switch to ${isDark ? "light" : "dark"} mode` : ""
            }
          >
            <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
            {!isCollapsed && (
              <span className="text-sm font-medium">
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isDark ? "bg-secondary" : "bg-gray-100"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {getInitials(user?.name)}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isDark ? "text-foreground" : "text-gray-900"
                  }`}
                >
                  {user?.name}
                </p>
                <p
                  className={`text-xs truncate ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  {user?.email}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mt-2 ${
              isDark
                ? "text-red-400 hover:bg-red-500/10"
                : "text-red-600 hover:bg-red-50"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Logout" : ""}
          >
            <span className="text-lg">🚪</span>
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
