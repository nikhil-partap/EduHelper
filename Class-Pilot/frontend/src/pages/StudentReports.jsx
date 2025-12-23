import React, { useEffect, useState } from "react";
// import { getStudentReport } from "../services/reportService"; // backend later

const StudentReport = () => {
  const [subjects, setSubjects] = useState([
    "All Subjects",
    "Mathematics",
    "Science",
    "English",
    "History",
  ]);

  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [reportData, setReportData] = useState([]);

  /* ---------------- BACKEND HOOK ---------------- */
  useEffect(() => {
    // This is where backend call will live
    // getStudentReport(selectedSubject).then(setReportData);

    // Temporary mock data
    const mockData = [
      { name: "Mathematics", score: 85, grade: "A" },
      { name: "Science", score: 78, grade: "B+" },
      { name: "English", score: 92, grade: "A+" },
      { name: "History", score: 74, grade: "B" },
    ];

    if (selectedSubject === "All Subjects") {
      setReportData(mockData);
    } else {
      setReportData(mockData.filter(s => s.name === selectedSubject));
    }
  }, [selectedSubject]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">Student Report</h1>

        {/* Subject Dropdown */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="mt-4 md:mt-0 bg-[#111] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {subjects.map((sub, index) => (
            <option key={index} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Average Score" value="82%" />
        <StatCard title="Attendance" value="94%" />
        <StatCard title="Class Rank" value="5 / 40" />
      </div>

      {/* Report Table */}
      <div className="bg-[#111] rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {selectedSubject} Performance
        </h2>

        <table className="w-full">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="py-3 text-left">Subject</th>
              <th className="py-3 text-left">Score</th>
              <th className="py-3 text-left">Grade</th>
              <th className="py-3 text-left">Progress</th>
            </tr>
          </thead>

          <tbody>
            {reportData.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-800 hover:bg-[#1a1a1a]"
              >
                <td className="py-4">{item.name}</td>
                <td className="py-4">{item.score}%</td>
                <td className="py-4 font-semibold">{item.grade}</td>
                <td className="py-4">
                  <div className="w-full bg-gray-700 h-2 rounded-full">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {reportData.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------- Reusable Stat Card ---------------- */
const StatCard = ({ title, value }) => (
  <div className="bg-[#111] rounded-xl p-6 shadow-lg">
    <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-lg bg-blue-600">
      📊
    </div>
    <p className="text-gray-400 text-sm">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default StudentReport;

