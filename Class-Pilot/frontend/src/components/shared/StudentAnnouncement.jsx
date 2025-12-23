
import React, { useEffect, useState } from "react";
// import { getAnnouncements } from "../services/announcementService";

const StudentAnnouncements = () => {
  /* ---------------- FILTER STATES ---------------- */
  const [classes, setClasses] = useState(["All", "10-A", "10-B", "12-A"]);
  const [streams, setStreams] = useState(["All", "Science", "Commerce", "Arts"]);
  const [subjects, setSubjects] = useState([
    "All",
    "Mathematics",
    "Physics",
    "English",
    "History",
  ]);

  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedStream, setSelectedStream] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const [announcements, setAnnouncements] = useState([]);

  /* ---------------- BACKEND HOOK ---------------- */
  useEffect(() => {
    // getAnnouncements({
    //   class: selectedClass,
    //   stream: selectedStream,
    //   subject: selectedSubject,
    // }).then(setAnnouncements);

    // Mock data
    const mockAnnouncements = [
      {
        id: 1,
        title: "Mid-Term Exam Schedule Released",
        message:
          "Mid-term examinations will start from 15th October. Please check the timetable.",
        class: "10-A",
        stream: "Science",
        subject: "Physics",
        teacher: "Mrs. Sharma",
        date: "2024-10-02",
        pinned: true,
      },
      {
        id: 2,
        title: "Math Assignment Submission",
        message:
          "Submit the algebra assignment by Friday via the portal.",
        class: "10-B",
        stream: "Science",
        subject: "Mathematics",
        teacher: "Mr. Verma",
        date: "2024-10-01",
        pinned: false,
      },
      {
        id: 3,
        title: "English Project Guidelines",
        message:
          "Group project guidelines have been uploaded under resources.",
        class: "12-A",
        stream: "Arts",
        subject: "English",
        teacher: "Ms. Roy",
        date: "2024-09-30",
        pinned: false,
      },
    ];

    const filtered = mockAnnouncements.filter((a) => {
      return (
        (selectedClass === "All" || a.class === selectedClass) &&
        (selectedStream === "All" || a.stream === selectedStream) &&
        (selectedSubject === "All" || a.subject === selectedSubject)
      );
    });

    setAnnouncements(filtered);
  }, [selectedClass, selectedStream, selectedSubject]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Announcements</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FilterDropdown
          label="Class"
          value={selectedClass}
          options={classes}
          onChange={setSelectedClass}
        />
        <FilterDropdown
          label="Stream"
          value={selectedStream}
          options={streams}
          onChange={setSelectedStream}
        />
        <FilterDropdown
          label="Subject"
          value={selectedSubject}
          options={subjects}
          onChange={setSelectedSubject}
        />
      </div>

      {/* Feed */}
      <div className="space-y-4 max-w-4xl">
        {announcements.map((a) => (
          <AnnouncementCard key={a.id} data={a} />
        ))}

        {announcements.length === 0 && (
          <p className="text-gray-500 text-center mt-8">
            No announcements available.
          </p>
        )}
      </div>
    </div>
  );
};

/* ---------------- Announcement Card ---------------- */
const AnnouncementCard = ({ data }) => (
  <div
    className={`rounded-xl p-6 shadow-lg border ${
      data.pinned
        ? "border-yellow-500 bg-[#1a1a1a]"
        : "border-gray-800 bg-[#111]"
    }`}
  >
    {data.pinned && (
      <span className="text-yellow-400 text-xs font-semibold">
        📌 PINNED
      </span>
    )}

    <h2 className="text-lg font-semibold mt-1">{data.title}</h2>

    <p className="text-gray-300 mt-2">{data.message}</p>

    <div className="flex flex-wrap gap-2 mt-4 text-xs text-gray-400">
      <span>👨‍🏫 {data.teacher}</span>
      <span>📘 {data.subject}</span>
      <span>🏫 {data.class}</span>
      <span>📅 {data.date}</span>
    </div>
  </div>
);

/* ---------------- Filter Dropdown ---------------- */
const FilterDropdown = ({ label, value, options, onChange }) => (
  <div>
    <label className="text-sm text-gray-400 mb-1 block">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#111] border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default StudentAnnouncements;
