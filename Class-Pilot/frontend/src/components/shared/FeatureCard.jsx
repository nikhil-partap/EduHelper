import {useTheme} from "../../hooks/useTheme";

const FeatureCard = ({
  title,
  description,
  icon,
  buttonText = "View",
  onClick,
  disabled = false,
  color = "blue",
}) => {
  const {theme} = useTheme();
  const isDark = theme === "dark";

  const gradients = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-500 to-amber-500",
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg ${
        isDark
          ? "bg-card border-border hover:border-ring"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className={`h-1.5 bg-gradient-to-r ${gradients[color]}`} />
      <div className="p-6">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradients[color]} flex items-center justify-center mb-4`}
        >
          <span className="text-white text-xl">{icon}</span>
        </div>
        <h3
          className={`font-semibold mb-1 ${
            isDark ? "text-foreground" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-sm mb-4 ${
            isDark ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          {description}
        </p>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            disabled
              ? isDark
                ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              : isDark
              ? "bg-white text-gray-900 hover:bg-gray-100"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default FeatureCard;
