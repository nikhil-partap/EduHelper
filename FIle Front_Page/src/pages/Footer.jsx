const Footer = () => {
  return (
    <footer className="border-t px-8 py-10 text-sm text-gray-600">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-semibold text-gray-800">Class Pilot</h4>
          <p className="mt-2">
            A secure, AI-powered classroom management system.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800">Product</h4>
          <ul className="mt-2 space-y-1">
            <li>Features</li>
            <li>Security</li>
            <li>Roadmap</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800">Legal</h4>
          <ul className="mt-2 space-y-1">
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
