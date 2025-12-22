const Alert = ({type = "info", message, onClose}) => {
  const typeStyles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-green-50 border-green-200 text-green-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
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
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
