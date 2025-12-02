import {useState, useEffect} from "react";
import axios from "axios";

const ConnectionTest = () => {
  const [status, setStatus] = useState("testing");
  const [results, setResults] = useState([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    const tests = [];

    try {
      // Test 1: Basic connectivity
      tests.push({name: "Server Connectivity", status: "testing"});
      setResults([...tests]);

      const response = await axios.get("http://localhost:5000/health");
      tests[0].status = "success";
      tests[0].data = response.data;

      // Test 2: CORS
      tests.push({name: "CORS Configuration", status: "success"});

      setResults([...tests]);
      setStatus("success");
    } catch (error) {
      tests[tests.length - 1].status = "error";
      tests[tests.length - 1].error = error.message;
      setResults([...tests]);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Backend Connection Test</h2>

      <div className="space-y-3">
        {results.map((test, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border rounded"
          >
            <span className="font-medium">{test.name}</span>
            <div className="flex items-center space-x-2">
              {test.status === "testing" && (
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              )}
              {test.status === "success" && (
                <span className="text-green-600 font-semibold">✓ Success</span>
              )}
              {test.status === "error" && (
                <span className="text-red-600 font-semibold">✗ Failed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {status === "success" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 font-semibold">
            🎉 Backend connection successful!
          </p>
          <p className="text-green-700 text-sm mt-1">
            Your frontend can communicate with the backend API.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 font-semibold">❌ Connection failed</p>
          <p className="text-red-700 text-sm mt-1">
            Make sure your backend server is running on http://localhost:5000
          </p>
          <button
            onClick={testConnection}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry Test
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;
