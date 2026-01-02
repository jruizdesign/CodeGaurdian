
import React from 'react';
import { SecurityAnalysis } from '../types.ts';
import VulnerabilityCard from './VulnerabilityCard.tsx';

interface AnalysisResultProps {
  analysis: SecurityAnalysis | null;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="text-center p-8 bg-gray-800/70 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-300">Ready to Scan</h2>
        <p className="mt-2 text-gray-400">Paste your code above and click "Scan" to begin the security analysis.</p>
      </div>
    );
  }

  const hasVulnerabilities = analysis.vulnerabilities && analysis.vulnerabilities.length > 0;

  return (
    <div className="w-full space-y-6">
      <div className="p-5 bg-gray-800 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Analysis Summary</h2>
        <p className="text-gray-300">{analysis.summary}</p>
      </div>

      {hasVulnerabilities ? (
        <div className="space-y-4">
          {analysis.vulnerabilities.map((vuln, index) => (
            <VulnerabilityCard key={index} vulnerability={vuln} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-green-900/50 border border-green-600 rounded-lg">
          <h3 className="text-2xl font-semibold text-green-200">No Vulnerabilities Found</h3>
          <p className="mt-2 text-green-300">The AI guardian found no security issues in the provided code snippet. Great job!</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;
