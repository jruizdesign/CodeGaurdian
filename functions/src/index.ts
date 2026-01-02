
import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import axios from "axios";

// It's good practice to set a user-agent to avoid being blocked by firewalls.
// Consider pointing the URL to a page explaining your scanner.
const axiosInstance = axios.create({
  headers: {
    "User-Agent": "CodeGuardianSecurityScanner/1.0",
  },
  timeout: 10000, // 10 second timeout
});

export const fetchUrlContent = functions.https.onCall(async (data, context) => {
  // Log the request data for debugging.
  logger.info("fetchUrlContent called with data:", { url: data.url });

  const url = data.url;

  // Validate the URL from the client.
  if (!url || typeof url !== "string") {
    logger.error("Validation failed: URL is missing or not a string.");
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with one argument 'url' that is a string."
    );
  }

  try {
    const response = await axiosInstance.get(url);
    logger.info(`Successfully fetched content from ${url}.`);
    return { html: response.data };
  } catch (error: unknown) {
    logger.error(`Error fetching URL ${url}:`, error);
    
    let message = "Failed to fetch the URL.";
    if (axios.isAxiosError(error)) {
        if (error.response) {
            message = `The server responded with status code: ${error.response.status}.`;
        } else if (error.request) {
            message = "The request was made but no response was received from the server.";
        } else {
            message = `Error setting up the request: ${error.message}.`;
        }
    } else if (error instanceof Error) {
        message = error.message;
    }

    // Return a structured error to the client.
    throw new functions.https.HttpsError(
      "internal",
      message,
      { originalError: error }
    );
  }
});
