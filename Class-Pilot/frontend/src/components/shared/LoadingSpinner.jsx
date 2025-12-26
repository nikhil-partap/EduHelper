import {useTheme} from "../../hooks/useTheme";

const LoadingSpinner = ({size = "md", text = "Loading..."}) => {
  const {theme} = useTheme();
  const isDark = theme === "dark";

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
      ></div>
      {text && (
        <p
          className={`mt-4 text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
