export const API_ERROR_RESPONSE = {
    error: true,
    message: "Basis API unavailable. Please try again shortly.",
    retry_after_seconds: 30,
};
export const TOOL_ANNOTATIONS = {
    readOnlyHint: true,
    openWorldHint: true,
};
export function textResult(value) {
    return {
        content: [
            {
                type: "text",
                text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
            },
        ],
    };
}
export function apiErrorResult() {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(API_ERROR_RESPONSE),
            },
        ],
    };
}
//# sourceMappingURL=response.js.map