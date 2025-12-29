const stats = [
  { value: "10k+", label: "Students Managed" },
  { value: "500+", label: "Teachers" },
  { value: "99.9%", label: "Attendance Accuracy" },
  { value: "AI-Driven", label: "Assessment Engine" },
];

const Stats = () => {
  return (
    <section className="bg-indigo-50 px-8 py-16">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => (
          <div key={i}>
            <p className="text-3xl font-bold text-indigo-600">{s.value}</p>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
