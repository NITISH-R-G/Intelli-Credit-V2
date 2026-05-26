import { AppError } from "../../types";

export const parseErrorToAppError = (err: unknown): AppError => {
  const rawLogs = err instanceof Error ? err.stack || err.message : String(err);
  let appError: AppError = {
    message: 'Analysis Failed',
    details: err instanceof Error ? err.message : 'An unknown error occurred during document processing.',
    rawLogs,
    type: 'UNKNOWN'
  };

  if (err instanceof Error) {
    if (err.message.includes('API_KEY')) {
      appError = {
        message: 'Authentication Error',
        details: 'The Gemini API key is missing or invalid.',
        action: 'Ensure the GEMINI_API_KEY is properly configured in the environment.',
        rawLogs,
        type: 'API_ERROR'
      };
    } else if (err.message.includes('JSON')) {
      appError = {
        message: 'Data Parsing Error',
        details: 'The AI model returned an invalid data format that could not be processed.',
        action: 'Try re-running the analysis or using a clearer document scan.',
        rawLogs,
        type: 'PARSING_ERROR'
      };
    } else if (err.message.includes('fetch')) {
      appError = {
        message: 'Network Error',
        details: 'Failed to communicate with external bureau services or the AI model.',
        action: 'Check your internet connection and verify the API key.',
        rawLogs,
        type: 'API_ERROR'
      };
    } else if (err.message.includes('TOOL_ERROR')) {
      appError = {
        message: 'Integration Tool Error',
        details: err.message.replace('TOOL_ERROR: ', ''),
        action: 'Verify your API keys and integration settings in the Bureau panel.',
        rawLogs,
        type: 'API_ERROR'
      };
    } else if (err.message.includes('FILE_ERROR')) {
      appError = {
        message: 'File Processing Error',
        details: err.message.replace('FILE_ERROR: ', ''),
        action: 'Check if the file is corrupted or in an unsupported format.',
        rawLogs,
        type: 'FILE_ERROR'
      };
    }
  }

  return appError;
};
