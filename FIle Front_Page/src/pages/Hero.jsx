const Hero = () => {
  return (
    <section
  className="px-8 py-24"
  style={{background: "linear-gradient(135deg, var(--bg-main), var(--bg-section))"}}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-extrabold leading-tight">
            One Platform. <br /> Complete Classroom Control.
          </h1>
          <p className="mt-6 text-gray-600 text-lg">
            Class Pilot simplifies classroom management using smart automation,
            secure APIs, and AI-powered learning tools.
          </p>

          <div className="mt-8 flex gap-4">
            <button className=" text-white px-6 py-3 rounded-lg">
              Student Access
            </button>
            <button className="border px-6 py-3 rounded-lg">
              Teacher Access
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="h-60 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold">
            Dashboard Preview
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
