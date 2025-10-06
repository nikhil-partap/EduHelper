import {useState} from "react";
import {useNavigate} from "react-router-dom";

import "./App.css";

export default function App() {
  const [selectedUserType, setSelectedUserType] = useState(null);
  const navigate = useNavigate();

  const handleUserTypeSelect = (userType) => {
    setSelectedUserType(userType);
    // Store user role in localStorage for persistence
    localStorage.setItem("userRole", userType);

    // Navigate to appropriate dashboard based on user type
    if (userType === "teacher") {
      navigate("/teacher-dashboard");
    } else if (userType === "student") {
      navigate("/student-dashboard");
    }

    console.log(`Selected user type: ${userType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EduHelper
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Your Learning Companion
          </p>
        </header>

        <main className="flex-1">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Choose Your Role
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select how you'll be using EduHelper today to get started with
              your personalized experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <button
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200"
              onClick={() => handleUserTypeSelect("teacher")}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                👩‍🏫
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                  Teacher
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Create engaging lessons, manage your students, and track their
                  progress with powerful tools
                </p>
              </div>
            </button>

            <button
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-200"
              onClick={() => handleUserTypeSelect("student")}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🎓
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                  Student
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Access interactive lessons, complete assignments, and track
                  your learning journey
                </p>
              </div>
            </button>
          </div>
        </main>

        <footer className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            © 2025 EduHelper - Empowering Education for Everyone
          </p>
        </footer>
      </div>
    </div>
  );
}
