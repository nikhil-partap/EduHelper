import {useTheme} from "../hooks/useTheme";

const ComingSoon = ({title, description, icon}) => {
  const {theme} = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="text-7xl mb-6">{icon}</div>
          <h1
            className={`text-3xl font-semibold mb-3 ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            {title}
          </h1>
          <p
            className={`text-lg mb-8 ${
              isDark ? "text-muted-foreground" : "text-gray-500"
            }`}
          >
            {description}
          </p>
          <div
            className={`rounded-xl p-6 max-w-md mx-auto border ${
              isDark
                ? "bg-gradient-to-br from-blue-950 to-purple-950 border-blue-900"
                : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100"
            }`}
          >
            <p
              className={`font-medium ${
                isDark ? "text-blue-400" : "text-blue-700"
              }`}
            >
              🚧 Coming Soon!
            </p>
            <p
              className={`text-sm mt-2 ${
                isDark ? "text-muted-foreground" : "text-gray-600"
              }`}
            >
              This feature is currently under development and will be available
              in the next update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
