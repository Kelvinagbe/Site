// app/tools/page.tsx
export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Tools
      </h1>
      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">PDF Tools</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Convert, merge, and manipulate PDF documents with ease.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">AI Tools</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Leverage artificial intelligence for document processing and analysis.
          </p>
        </div>
      </div>
    </div>
  );
}