
export interface Vulnerability {
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  description: string;
  remediation: string;
  lineNumber?: number;
}

export interface SecurityAnalysis {
  summary: string;
  vulnerabilities: Vulnerability[];
}
