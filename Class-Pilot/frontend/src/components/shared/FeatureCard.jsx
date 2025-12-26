import {useTheme} from "../../hooks/useTheme";

const FeatureCard = ({
  title,
  description,
  icon,
  buttonText = "Coming Soon",
  onClick,
  disabled = true,
  color = "blue",
}) => {
  const {theme} = useTheme();
  const isDark = theme === "dark";

  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green:
      "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple:
      "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    orange:
      "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
  };

  const iconBgClasses = {
    blue: isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600",
    green: isDark
      ? "bg-green-500/20 text-green-400"
      : "bg-green-100 text-green-600",
    purple: isDark
      ? "bg-purple-500/20 text-purple-400"
      : "bg-purple-100 text-purple-600",
    orange: isDark
      ? "bg-orange-500/20 text-orange-400"
      : "bg-orange-100 text-orange-600",
  };

  return (
    <div
      className={`overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-all duration-300 ${
        isDark
          ? "bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
          : "bg-white border border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div
            className={`h-12 w-12 ${iconBgClasses[color]} rounded-lg flex items-center justify-center text-2xl`}
          >
            {icon}
          </div>
          <h3
            className={`ml-4 text-lg font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
        </div>

        <p
          className={`mb-6 text-sm leading-relaxed ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {description}
        </p>

        <button
          onClick={onClick}
          disabled={disabled}
          className={`
            w-full px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${
              disabled
                ? isDark
                  ? "bg-zinc-800 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : `bg-gradient-to-r ${colorClasses[color]} text-white hover:shadow-md transform hover:-translate-y-0.5`
            }
          `}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default FeatureCard;
