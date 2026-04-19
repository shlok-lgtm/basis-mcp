export const API_ERROR_RESPONSE = {
  error: true,
  message: "Basis API unavailable. Please try again shortly.",
  retry_after_seconds: 30,
} as const;

export const TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  openWorldHint: true,
} as const;

export function textResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

export function apiErrorResult() {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(API_ERROR_RESPONSE),
      },
    ],
  };
}
