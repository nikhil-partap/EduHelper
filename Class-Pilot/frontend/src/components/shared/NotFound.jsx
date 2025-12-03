import {useAuth} from "../../hooks/useAuth";

const NotFound = () => {
  const {isAuthenticated} = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <button
          onClick={() =>
            (window.location.href = isAuthenticated ? "/dashboard" : "/")
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
        >
          {isAuthenticated ? "Back to Dashboard" : "Go to Login"}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
