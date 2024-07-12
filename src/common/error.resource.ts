export type ErrorResponse = {
  message: string;
};

export function createErrorResponse(message: string): ErrorResponse {
  return { message };
}