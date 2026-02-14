"use client";

import { useState } from 'react';

interface PreviewData {
  url: string;
  title: string;
  description: string;
  ogImage: string;
  favicon?: string;
}

export default function Home() {
  const [url, setUrl] = useState<string>('');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<string>('');

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    setPreviewData(null);
    setRawJson('');

    try {
      const response = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred');
      }

      setPreviewData(data);
      setRawJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch preview');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawJson);
    alert('Raw JSON copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">LinkLens</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="url"
            className="flex-grow p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handlePreview();
              }
            }}
          />
          <button
            onClick={handlePreview}
            disabled={loading || !url}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Preview'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-800 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {previewData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Preview Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {previewData.ogImage && (
                <img src={previewData.ogImage} alt={previewData.title || 'Preview Image'} className="w-full h-48 object-cover"/>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{previewData.title || 'No Title'}</h2>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{previewData.description || 'No Description'}</p>
                <a
                  href={previewData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {previewData.url}
                </a>
                {previewData.favicon && <img src={previewData.favicon} alt="Favicon" className="w-4 h-4 inline-block ml-2"/>}
              </div>
            </div>

            {/* Raw JSON Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Raw JSON</h2>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-lg transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md text-sm overflow-auto max-h-96">
                <code>{rawJson}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
