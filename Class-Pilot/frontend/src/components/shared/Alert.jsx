import {useTheme} from "../../hooks/useTheme";

const Alert = ({type = "info", message, onClose}) => {
  const {theme} = useTheme();
  const isDark = theme === "dark";

  const typeStyles = {
    error: isDark
      ? "bg-red-900/30 border-red-800 text-red-400"
      : "bg-red-50 border-red-200 text-red-700",
    success: isDark
      ? "bg-green-900/30 border-green-800 text-green-400"
      : "bg-green-50 border-green-200 text-green-700",
    warning: isDark
      ? "bg-yellow-900/30 border-yellow-800 text-yellow-400"
      : "bg-yellow-50 border-yellow-200 text-yellow-700",
    info: isDark
      ? "bg-blue-900/30 border-blue-800 text-blue-400"
      : "bg-blue-50 border-blue-200 text-blue-700",
  };

  const iconStyles = {
    error: "❌",
    success: "✅",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div
      className={`border px-4 py-3 rounded-md flex items-start space-x-3 ${typeStyles[type]}`}
    >
      <span className="text-lg">{iconStyles[type]}</span>
      <div className="flex-1">
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-2 ${
            isDark
              ? "text-gray-500 hover:text-gray-300"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
