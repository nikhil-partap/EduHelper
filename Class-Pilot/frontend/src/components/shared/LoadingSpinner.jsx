import {useTheme} from "../../hooks/useTheme";

const LoadingSpinner = ({size = "md", text = "Loading..."}) => {
  const {theme} = useTheme();
  const isDark = theme === "dark";

  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-10 w-10 border-2",
    lg: "h-14 w-14 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-blue-500 border-t-transparent ${sizeClasses[size]}`}
      />
      {text && (
        <p
          className={`text-sm ${
            isDark ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
