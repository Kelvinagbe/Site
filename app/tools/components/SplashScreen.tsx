export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-8">
          <img 
            src="./favicon.ico" 
            alt="Loading" 
            className="w-24 h-24 mx-auto animate-pulse"
          />
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
        </div>
        <div className="text-white space-y-4">
          <h1 className="text-3xl font-bold">Tools Hub</h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-blue-200">Syncing your workspace...</p>
        </div>
      </div>
    </div>
  );
}