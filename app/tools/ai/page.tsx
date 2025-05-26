import AIAssistant from "../components/AIAssistant";

export default function AIPage() {
  return (
    <div className="h-screen p-6 bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-3xl h-full flex flex-col shadow-lg rounded-lg bg-white">
        <header className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
        </header>
        <main className="flex-1">
          <AIAssistant />
        </main>
      </div>
    </div>
  );
}