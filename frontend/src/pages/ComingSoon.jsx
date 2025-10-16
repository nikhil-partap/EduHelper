const ComingSoon = ({title, description, icon}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-20">
        <div className="text-8xl mb-6">{icon}</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 mb-8">{description}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-blue-800 font-medium">🚧 Coming Soon!</p>
          <p className="text-blue-600 text-sm mt-2">
            This feature is currently under development and will be available in
            the next update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
