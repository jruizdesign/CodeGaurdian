
import React, { useState } from 'react';
import Header from './components/Header.tsx';
import CodeInput from './components/CodeInput.tsx';
import UrlInput from './components/UrlInput.tsx';
import AnalysisResult from './components/AnalysisResult.tsx';
import Loader from './components/Loader.tsx';
import ErrorDisplay from './components/ErrorDisplay.tsx';
import { useSecurityScanner } from './hooks/useSecurityScanner.ts';
import { SecurityAnalysis } from './types.ts';
import { SUPPORTED_LANGUAGES } from './constants.ts';

type ScanMode = 'code' | 'url';

const App: React.FC = () => {
  const [scanMode, setScanMode] = useState<ScanMode>('code');
  const [code, setCode] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0]);
  const [analysis, setAnalysis] = useState<SecurityAnalysis | null>(null);
  const { scanCode, scanUrl, isLoading, error, setError } = useSecurityScanner();

  const handleCodeScan = async () => {
    setError(null);
    setAnalysis(null);
    const result = await scanCode(code, language);
    if (result) {
      setAnalysis(result);
    }
  };

  const handleUrlScan = async () => {
    setError(null);
    setAnalysis(null);
    const result = await scanUrl(url);
    if (result) {
      setAnalysis(result);
    }
  };

  const renderScanInput = () => {
    if (scanMode === 'code') {
      return (
        <CodeInput
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          onScan={handleCodeScan}
          isLoading={isLoading}
        />
      );
    }
    return (
      <UrlInput
        url={url}
        setUrl={setUrl}
        onScan={handleUrlScan}
        isLoading={isLoading}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header />
        <div className="mt-8 p-6 bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700">
          <div className="mb-6 flex justify-center border-b border-gray-700">
            <button
              onClick={() => setScanMode('code')}
              className={`px-4 py-2 text-lg font-medium transition-colors duration-200 ${scanMode === 'code' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
              aria-pressed={scanMode === 'code'}
            >
              Code Snippet
            </button>
            <button
              onClick={() => setScanMode('url')}
              className={`px-4 py-2 text-lg font-medium transition-colors duration-200 ${scanMode === 'url' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
              aria-pressed={scanMode === 'url'}
            >
              Website URL
            </button>
          </div>
          {renderScanInput()}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <ErrorDisplay message={error} />
          ) : (
            <AnalysisResult analysis={analysis} />
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Google Gemini. For educational and illustrative purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
