const features = [
  { icon: "🧑‍🏫", title: "Attendance Tracking", desc: "Accurate, real-time attendance with analytics." },
  { icon: "🤖", title: "AI Quiz Generator", desc: "Generate quizzes instantly by topic & difficulty." },
  { icon: "📊", title: "Student Dashboards", desc: "Visual progress tracking for students." },
  { icon: "📢", title: "Announcements", desc: "Classroom-style notifications and updates." },
  { icon: "🔐", title: "Secure APIs", desc: "JWT-based role-secured backend architecture." },
  { icon: "🎯", title: "Human-Centered UX", desc: "Designed for clarity and efficiency." },
];

const Features = () => {
  return (
    <section id="features" className="px-8 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">
        Powerful Features for Modern Education
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="border rounded-xl p-6 hover:shadow-lg transition">
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-gray-600 mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
