import {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";

const Navigation = () => {
  const {user, logout, isAuthenticated} = useAuth();
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
          {name: "Attendance", href: "/attendance", icon: "📊"},
          {name: "Assignments", href: "/assignments", icon: "📝"},
          {name: "Students", href: "/students", icon: "👥"},
        ]
      : [
          {name: "Dashboard", href: "/dashboard", icon: "🏠"},
          {name: "My Classes", href: "/classes", icon: "📚"},
          {name: "Assignments", href: "/assignments", icon: "📝"},
          {name: "Grades", href: "/grades", icon: "🎯"},
          {name: "Schedule", href: "/schedule", icon: "📅"},
        ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">CP</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                Class Pilot
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors duration-200 ${
                  location.pathname === item.href
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user?.name}</span>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </div>
              </div>
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
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
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 ${
                    location.pathname === item.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-3 py-2 text-sm text-gray-700">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">
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
