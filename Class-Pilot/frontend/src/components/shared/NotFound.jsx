import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../hooks/useTheme";

const NotFound = () => {
  const {isAuthenticated} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-background" : "bg-gray-50"
      }`}
    >
      <div className="text-center px-4">
        <div className="text-6xl mb-4">🤔</div>
        <h1
          className={`text-5xl font-bold mb-3 ${
            isDark ? "text-foreground" : "text-gray-900"
          }`}
        >
          404
        </h1>
        <p
          className={`text-lg mb-8 ${
            isDark ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          Oops! The page you're looking for doesn't exist.
        </p>
        <button
          onClick={() =>
            (window.location.href = isAuthenticated ? "/dashboard" : "/")
          }
          className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
            isDark
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {isAuthenticated ? "Back to Dashboard" : "Go to Login"}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
