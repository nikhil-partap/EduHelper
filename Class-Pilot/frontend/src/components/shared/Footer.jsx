import {useTheme} from "../../hooks/useTheme";

const Footer = () => {
  const {theme} = useTheme();
  const isDark = theme === "dark";

  return (
    <footer
      className={`border-t mt-auto ${
        isDark ? "bg-card border-border" : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">CP</span>
            </div>
            <span
              className={`text-sm ${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              © 2025 Class Pilot. Built for better education.
            </span>
          </div>

          <div
            className={`flex items-center gap-6 text-sm ${
              isDark ? "text-muted-foreground" : "text-gray-500"
            }`}
          >
            <a href="#" className="hover:text-blue-600 transition-colors">
              Help
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
