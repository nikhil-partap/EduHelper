const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">CP</span>
            </div>
            <span className="text-gray-600 text-sm">
              © 2024 LeetClass. Built for better education.
            </span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-500">
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
