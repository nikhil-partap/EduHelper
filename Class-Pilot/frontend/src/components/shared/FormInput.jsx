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
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
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
            placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm
            ${icon ? "pl-10" : ""}
            ${
              error
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }
          `}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
