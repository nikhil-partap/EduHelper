import {useState} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import FormInput from "../shared/FormInput";
import Alert from "../shared/Alert";
import LoadingSpinner from "../shared/LoadingSpinner";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const {login, loading, error, clearError} = useAuth();

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      // Navigation will be handled by App component
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">CP</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome to Class Pilot
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your classroom management system
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} onClose={clearError} />}

          <div className="space-y-4">
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" text="" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-500 text-sm block w-full"
            >
              Don't have an account? Sign up
            </Link>
            <button
              type="button"
              onClick={() =>
                window.open("http://localhost:5000/health", "_blank")
              }
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              Test Backend Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
