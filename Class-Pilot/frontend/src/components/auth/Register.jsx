import {useState} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../hooks/useTheme";

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

  const inputClass = `mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${
    isDark
      ? "bg-zinc-800 border-zinc-700 text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
  }`;

  const labelClass = `block text-sm font-medium ${
    isDark ? "text-gray-200" : "text-gray-700"
  }`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isDark ? "bg-black" : "bg-gray-50"
      }`}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">CP</span>
          </div>
          <h2
            className={`text-3xl font-extrabold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Join Class Pilot
          </h2>
          <p
            className={`mt-2 text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Create your account to get started
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              className={`border px-4 py-3 rounded ${
                isDark
                  ? "bg-red-900/30 border-red-800 text-red-400"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-400 text-sm"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
