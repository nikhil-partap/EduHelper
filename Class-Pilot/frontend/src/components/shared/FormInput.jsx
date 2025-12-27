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
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium ${
            isDark ? "text-foreground" : "text-gray-700"
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span
              className={isDark ? "text-muted-foreground" : "text-gray-400"}
            >
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
            w-full px-3 py-2 rounded-md border text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors
            ${icon ? "pl-10" : ""}
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : isDark
                ? "border-border"
                : "border-gray-300"
            }
            ${
              isDark
                ? "bg-input-background text-foreground placeholder-muted-foreground"
                : "bg-white text-gray-900 placeholder-gray-400"
            }
          `}
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default FormInput;
