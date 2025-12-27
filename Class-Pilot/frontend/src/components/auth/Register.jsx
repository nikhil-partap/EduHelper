import {useState} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../hooks/useTheme";
import LoadingSpinner from "../shared/LoadingSpinner";
import Alert from "../shared/Alert";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    schoolName: "",
    rollNumber: "",
  });
  const {register, loading, error, clearError} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };
    if (formData.role === "teacher") {
      submitData.schoolName = formData.schoolName;
    } else {
      submitData.rollNumber = formData.rollNumber;
    }
    await register(submitData);
  };

  const inputClass = `w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? "bg-input-background border-border text-foreground placeholder-muted-foreground"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${
    isDark ? "text-foreground" : "text-gray-700"
  }`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
        isDark ? "bg-background" : "bg-gray-50"
      }`}
    >
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">CP</span>
          </div>
          <h1
            className={`text-2xl font-semibold ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            Join Class Pilot
          </h1>
          <p
            className={`mt-2 ${
              isDark ? "text-muted-foreground" : "text-gray-500"
            }`}
          >
            Create your account to get started
          </p>
        </div>

        {/* Form Card */}
        <div
          className={`rounded-xl border p-8 ${
            isDark ? "bg-card border-border" : "bg-white border-gray-200"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert type="error" message={error} onClose={clearError} />
            )}

            <div>
              <label htmlFor="name" className={labelClass}>
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="role" className={labelClass}>
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {formData.role === "teacher" ? (
              <div>
                <label htmlFor="schoolName" className={labelClass}>
                  School Name
                </label>
                <input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter your school name"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="rollNumber" className={labelClass}>
                  Roll Number
                </label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter your roll number"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" text="" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div
            className={`mt-6 pt-6 border-t text-center ${
              isDark ? "border-border" : "border-gray-200"
            }`}
          >
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
