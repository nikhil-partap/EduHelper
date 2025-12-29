const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b bg-white sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-indigo-600">Class Pilot</h1>

      <div className="hidden md:flex gap-6 text-sm">
        <a href="#features" className="hover:text-indigo-600">Features</a>
        <a href="#students" className="hover:text-indigo-600">Students</a>
        <a href="#teachers" className="hover:text-indigo-600">Teachers</a>
        <a href="#about" className="hover:text-indigo-600">About</a>
      </div>

      <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg">
        Login
      </button>
    </nav>
  );
};

export default Navbar;
