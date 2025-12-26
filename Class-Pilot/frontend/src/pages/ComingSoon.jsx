import {useTheme} from "../hooks/useTheme";

const ComingSoon = ({title, description, icon}) => {
  const {theme} = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-20">
        <div className="text-8xl mb-6">{icon}</div>
        <h1
          className={`text-4xl font-bold mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h1>
        <p
          className={`text-xl mb-8 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {description}
        </p>
        <div
          className={`rounded-lg p-6 max-w-md mx-auto border ${
            isDark
              ? "bg-blue-900/20 border-blue-800"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <p
            className={`font-medium ${
              isDark ? "text-blue-400" : "text-blue-800"
            }`}
          >
            🚧 Coming Soon!
          </p>
          <p
            className={`text-sm mt-2 ${
              isDark ? "text-blue-300" : "text-blue-600"
            }`}
          >
            This feature is currently under development and will be available in
            the next update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
