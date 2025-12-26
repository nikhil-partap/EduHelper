const FeatureCard = ({
  title,
  description,
  icon,
  buttonText = "Coming Soon",
  onClick,
  disabled = true,
  color = "blue",
}) => {
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
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/20 text-orange-400",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl hover:border-zinc-700 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div
            className={`h-12 w-12 ${iconBgClasses[color]} rounded-lg flex items-center justify-center text-2xl`}
          >
            {icon}
          </div>
          <h3 className="ml-4 text-lg font-semibold text-white">{title}</h3>
        </div>

        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          {description}
        </p>

        <button
          onClick={onClick}
          disabled={disabled}
          className={`
            w-full px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${
              disabled
                ? "bg-zinc-800 text-gray-500 cursor-not-allowed"
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
