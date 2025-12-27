import {useState} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../hooks/useTheme";
import FormInput from "../shared/FormInput";
import Alert from "../shared/Alert";
import LoadingSpinner from "../shared/LoadingSpinner";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const {login, loading, error, clearError} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

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
            Welcome to Class Pilot
          </h1>
          <p
            className={`mt-2 ${
              isDark ? "text-muted-foreground" : "text-gray-500"
            }`}
          >
            Sign in to your classroom management system
          </p>
        </div>

        {/* Form Card */}
        <div
          className={`rounded-xl border p-8 ${
            isDark ? "bg-card border-border" : "bg-white border-gray-200"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert type="error" message={error} onClose={clearError} />
            )}

            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              icon="📧"
            />

            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              icon="🔒"
            />

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
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div
            className={`mt-6 pt-6 border-t text-center ${
              isDark ? "border-border" : "border-gray-200"
            }`}
          >
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
