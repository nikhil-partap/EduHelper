import {useTheme} from "../../hooks/useTheme";

const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon,
}) => {
  const {theme} = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className={`block text-sm font-medium ${
          isDark ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={isDark ? "text-gray-500" : "text-gray-400"}>
              {icon}
            </span>
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            appearance-none relative block w-full px-3 py-2 border rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            focus:z-10 sm:text-sm transition-colors
            ${icon ? "pl-10" : ""}
            ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : isDark
                ? "border-zinc-700"
                : "border-gray-300"
            }
            ${
              isDark
                ? "bg-zinc-800 text-white placeholder-gray-500"
                : "bg-white text-gray-900 placeholder-gray-500"
            }
          `}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
