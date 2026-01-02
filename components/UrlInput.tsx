
import React from 'react';

interface UrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  onScan: () => void;
  isLoading: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ url, setUrl, onScan, isLoading }) => {
  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full p-4 font-mono text-sm bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300"
          aria-label="Website URL input"
        />
      </div>
      
      <div className="bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg text-sm" role="alert">
        <p><strong className="font-bold">Backend Setup Required:</strong> This feature uses Firebase Cloud Functions to securely fetch website content. You must deploy the provided Cloud Function code and configure your Firebase credentials in <code>firebase.ts</code> for this to work.</p>
      </div>

      <button
        onClick={onScan}
        disabled={isLoading || !url.trim()}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scanning URL...
          </>
        ) : (
          'Scan Website'
        )}
      </button>
    </div>
  );
};

export default UrlInput;
