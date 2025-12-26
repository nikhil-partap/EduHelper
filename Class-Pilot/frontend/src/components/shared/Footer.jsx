import {useTheme} from "../../hooks/useTheme";

const Footer = () => {
  const {theme} = useTheme();

  return (
    <footer
      className={`border-t mt-12 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-zinc-900 border-zinc-800"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">CP</span>
            </div>
            <span
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              © 2024 Class Pilot. Built for better education.
            </span>
          </div>

          <div
            className={`flex items-center space-x-6 text-sm ${
              theme === "dark" ? "text-gray-500" : "text-gray-500"
            }`}
          >
            <a href="#" className="hover:text-blue-500 transition-colors">
              Help
            </a>
            <a href="#" className="hover:text-blue-500 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-500 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
