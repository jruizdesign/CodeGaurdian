
import { useState } from 'react';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { SecurityAnalysis } from '../types.ts';
import { fetchUrlContentCallable } from '../firebase.ts';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A brief one-sentence summary of the security findings.",
    },
    vulnerabilities: {
      type: Type.ARRAY,
      description: "A list of security vulnerabilities found in the code.",
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "The type of vulnerability (e.g., XSS, SQL Injection).",
          },
          severity: {
            type: Type.STRING,
            description: "The severity of the vulnerability (Critical, High, Medium, Low, Informational).",
          },
          description: {
            type: Type.STRING,
            description: "A detailed explanation of the vulnerability.",
          },
          remediation: {
            type: Type.STRING,
            description: "Specific code examples or steps to fix the vulnerability.",
          },
          lineNumber: {
            type: Type.INTEGER,
            description: "The line number in the code where the vulnerability is located.",
          },
        },
        required: ["type", "severity", "description", "remediation"],
      },
    },
  },
  required: ["summary", "vulnerabilities"],
};

export const useSecurityScanner = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const scanCode = async (code: string, language: string): Promise<SecurityAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    if (!API_KEY) {
        setError("API key is not configured. Please set the API_KEY environment variable.");
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
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          role: 'user',
          parts: [{ text: prompt }],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.1,
        },
      });

      const jsonText = response.text.trim();
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
        setError("API key is not configured. Please set the API_KEY environment variable.");
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

        const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { role: 'user', parts: [{ text: urlPrompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                temperature: 0.1,
            },
        });

        const jsonText = geminiResponse.text.trim();
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
