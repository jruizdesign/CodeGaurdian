
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants.ts';

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onScan: () => void;
  isLoading: boolean;
}

const CodeInput: React.FC<CodeInputProps> = ({ code, setCode, language, setLanguage, onScan, isLoading }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <label htmlFor="language-select" className="text-lg font-medium text-gray-300 shrink-0">
          Select Language
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full sm:w-auto bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
          aria-label="Select programming language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={`Paste your ${language} code here...`}
        className="w-full h-64 p-4 font-mono text-sm bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300 resize-y"
        aria-label="Code input area"
      />

      <button
        onClick={onScan}
        disabled={isLoading || !code.trim()}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scanning...
          </>
        ) : (
          'Scan for Vulnerabilities'
        )}
      </button>
    </div>
  );
};

export default CodeInput;
