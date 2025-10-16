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

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div
            className={`h-12 w-12 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center text-white text-2xl`}
          >
            {icon}
          </div>
          <h3 className="ml-4 text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {description}
        </p>

        <button
          onClick={onClick}
          disabled={disabled}
          className={`
            w-full px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${
              disabled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
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
