import {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../hooks/useTheme";

const Navigation = () => {
  const {user, logout, isAuthenticated} = useAuth();
  const {theme, toggleTheme} = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Don't show navigation on login/register pages
  if (
    !isAuthenticated &&
    (location.pathname === "/login" || location.pathname === "/register")
  ) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  const menuItems =
    user?.role === "teacher"
      ? [
          {name: "Dashboard", href: "/dashboard", icon: "🏠"},
          {name: "My Classes", href: "/classes", icon: "📚"},
          {name: "Assignments", href: "/assignments", icon: "📋"},
          {name: "Timetable", href: "/timetable", icon: "🗓️"},
          {name: "Attendance", href: "/attendance", icon: "📊"},
          {name: "Quizzes", href: "/quizzes", icon: "📝"},
          {name: "Meetings", href: "/meetings", icon: "📹"},
        ]
      : [
          {name: "Dashboard", href: "/dashboard", icon: "🏠"},
          {name: "My Classes", href: "/classes", icon: "📚"},
          {name: "Assignments", href: "/assignments", icon: "📋"},
          {name: "Timetable", href: "/timetable", icon: "🗓️"},
          {name: "My Attendance", href: "/my-attendance", icon: "📊"},
          {name: "Quizzes", href: "/quizzes", icon: "📝"},
          {name: "Grades", href: "/grades", icon: "🎯"},
          {name: "Meetings", href: "/meetings", icon: "📹"},
        ];

  return (
    <nav className="bg-zinc-900 dark:bg-zinc-900 light:bg-white border-b border-zinc-800 dark:border-zinc-800 light:border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">CP</span>
              </div>
              <span className="ml-2 text-xl font-bold text-white dark:text-white light:text-gray-900">
                Class Pilot
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors duration-200 ${
                  location.pathname === item.href
                    ? "text-blue-400 bg-zinc-800 dark:bg-zinc-800 light:bg-blue-50"
                    : "text-gray-300 dark:text-gray-300 light:text-gray-600 hover:text-blue-400"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-gray-100 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-gray-200 transition-colors duration-200"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <span className="text-yellow-400 text-lg">☀️</span>
              ) : (
                <span className="text-gray-600 text-lg">🌙</span>
              )}
            </button>

            <div className="hidden md:flex items-center space-x-3">
              <div className="text-sm text-gray-200 dark:text-gray-200 light:text-gray-700">
                <span className="font-medium">{user?.name}</span>
                <div className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500 capitalize">
                  {user?.role}
                </div>
              </div>
              <div className="h-8 w-8 bg-zinc-700 dark:bg-zinc-700 light:bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-200 dark:text-gray-200 light:text-gray-700 text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Logout
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-zinc-800"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-zinc-800 dark:border-zinc-800 light:border-gray-200">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 ${
                    location.pathname === item.href
                      ? "text-blue-400 bg-zinc-800"
                      : "text-gray-300 dark:text-gray-300 light:text-gray-600 hover:text-blue-400"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="border-t border-zinc-800 dark:border-zinc-800 light:border-gray-200 pt-3 mt-3">
                <div className="px-3 py-2 text-sm text-gray-200 dark:text-gray-200 light:text-gray-700">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-gray-400 capitalize">
                    {user?.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
