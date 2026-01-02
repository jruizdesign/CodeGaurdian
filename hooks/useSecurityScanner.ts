import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SecurityAnalysis } from '../types.ts';
import { fetchUrlContentCallable } from '../firebase.ts';

const API_KEY = import.meta.env.VITE_API_KEY;
if (!API_KEY) {
  console.warn("VITE_API_KEY environment variable not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "YOUR_API_KEY");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "OBJECT" as any,
      properties: {
        summary: {
          type: "STRING" as any,
          description: "A brief one-sentence summary of the security findings.",
        },
        vulnerabilities: {
          type: "ARRAY" as any,
          description: "A list of security vulnerabilities found in the code.",
          items: {
            type: "OBJECT" as any,
            properties: {
              type: {
                type: "STRING" as any,
                description: "The type of vulnerability (e.g., XSS, SQL Injection).",
              },
              severity: {
                type: "STRING" as any,
                description: "The severity of the vulnerability (Critical, High, Medium, Low, Informational).",
              },
              description: {
                type: "STRING" as any,
                description: "A detailed explanation of the vulnerability.",
              },
              remediation: {
                type: "STRING" as any,
                description: "Specific code examples or steps to fix the vulnerability.",
              },
              lineNumber: {
                type: "INTEGER" as any,
                description: "The line number in the code where the vulnerability is located.",
              },
            },
            required: ["type", "severity", "description", "remediation"],
          },
        },
      },
      required: ["summary", "vulnerabilities"],
    },
    temperature: 0.1,
  }
});

export const useSecurityScanner = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const scanCode = async (code: string, language: string): Promise<SecurityAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    if (!API_KEY) {
      setError("API key is not configured. Please set the VITE_API_KEY environment variable.");
      setIsLoading(false);
      return null;
    }

    if (!code.trim()) {
      setError("Code input cannot be empty.");
      setIsLoading(false);
      return null;
    }

    const prompt = `
      You are a world-class cybersecurity expert and senior software engineer. Your task is to perform a thorough security audit of the provided code snippet.
      Analyze it for any security vulnerabilities, including but not limited to the OWASP Top 10 (e.g., Injection, Broken Authentication, Cross-Site Scripting (XSS), Insecure Deserialization, etc.), race conditions, logic flaws, and insecure use of dependencies.

      The code is written in: ${language}

      Code to analyze:
      \`\`\`${language.toLowerCase()}
      ${code}
      \`\`\`

      Provide a detailed report in the specified JSON format.
      For each vulnerability found, you must:
      1.  Identify the vulnerability type.
      2.  Assign a severity level (Critical, High, Medium, Low, Informational).
      3.  Provide a clear and concise description of the issue and its potential impact.
      4.  Offer a specific, actionable remediation with corrected code examples where applicable.
      5.  Specify the line number where the vulnerability is located.

      If no vulnerabilities are found, provide a summary stating the code appears secure and leave the vulnerabilities array empty.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text();
      const analysisResult: SecurityAnalysis = JSON.parse(jsonText);

      return analysisResult;
    } catch (e) {
      console.error("Error during security scan:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during the scan.";
      setError(`Failed to analyze code. ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const scanUrl = async (url: string): Promise<SecurityAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    if (!API_KEY) {
      setError("API key is not configured. Please set the VITE_API_KEY environment variable.");
      setIsLoading(false);
      return null;
    }

    if (!url.trim()) {
      setError("URL input cannot be empty.");
      setIsLoading(false);
      return null;
    }

    let validatedUrl;
    try {
      validatedUrl = new URL(url);
    } catch (_) {
      setError("Invalid URL provided. Please include http:// or https://");
      setIsLoading(false);
      return null;
    }

    try {
      // Call the Firebase Cloud Function to fetch the URL content
      const result = await fetchUrlContentCallable({ url: validatedUrl.href });
      const data = result.data as { html?: string; error?: string };

      if (data.error || !data.html) {
        throw new Error(data.error || "Cloud function returned empty content.");
      }
      const htmlContent = data.html;

      const urlPrompt = `
            You are a world-class cybersecurity expert. Your task is to perform a thorough security audit of the provided website's source code (HTML, inline CSS, and inline JavaScript).
            Analyze it for any security vulnerabilities, including but not limited to the OWASP Top 10 (e.g., XSS from user inputs reflected in HTML, insecure 'src' attributes, insecure form handling, Content Security Policy issues, etc.), and other common web vulnerabilities.

            Website source code to analyze:
            \`\`\`html
            ${htmlContent}
            \`\`\`

            Provide a detailed report in the specified JSON format.
            For each vulnerability found, you must:
            1.  Identify the vulnerability type.
            2.  Assign a severity level (Critical, High, Medium, Low, Informational).
            3.  Provide a clear and concise description of the issue and its potential impact.
            4.  Offer a specific, actionable remediation with corrected code examples where applicable.
            5.  Specify the line number in the source code where the vulnerability is located.

            If no vulnerabilities are found, provide a summary stating the code appears secure and leave the vulnerabilities array empty.
        `;

      const geminiResponse = await model.generateContent(urlPrompt);
      const response = await geminiResponse.response;
      const jsonText = response.text();
      const analysisResult: SecurityAnalysis = JSON.parse(jsonText);

      return analysisResult;

    } catch (e) {
      console.error("Error during URL scan:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during the scan.";
      setError(`Failed to analyze URL. This could be due to an invalid Firebase configuration, a network issue, or the target website blocking automated requests. Details: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { scanCode, scanUrl, isLoading, error, setError };
};
