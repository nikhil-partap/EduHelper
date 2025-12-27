import {useTheme} from "../../hooks/useTheme";

const Alert = ({type = "info", message, onClose}) => {
  const {theme} = useTheme();
  const isDark = theme === "dark";

  const typeStyles = {
    error: isDark
      ? "bg-red-950 border-red-900 text-red-400"
      : "bg-red-50 border-red-200 text-red-700",
    success: isDark
      ? "bg-green-950 border-green-900 text-green-400"
      : "bg-green-50 border-green-200 text-green-700",
    warning: isDark
      ? "bg-yellow-950 border-yellow-900 text-yellow-400"
      : "bg-yellow-50 border-yellow-200 text-yellow-700",
    info: isDark
      ? "bg-blue-950 border-blue-900 text-blue-400"
      : "bg-blue-50 border-blue-200 text-blue-700",
  };

  const icons = {
    error: "❌",
    success: "✅",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div
      className={`border px-4 py-3 rounded-lg flex items-start gap-3 mb-4 ${typeStyles[type]}`}
    >
      <span className="text-base flex-shrink-0">{icons[type]}</span>
      <p className="flex-1 text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className={`text-lg leading-none hover:opacity-70 transition-opacity ${
            isDark ? "text-current" : "text-current"
          }`}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
