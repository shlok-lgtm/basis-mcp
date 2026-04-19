export declare const API_ERROR_RESPONSE: {
    readonly error: true;
    readonly message: "Basis API unavailable. Please try again shortly.";
    readonly retry_after_seconds: 30;
};
export declare const TOOL_ANNOTATIONS: {
    readonly readOnlyHint: true;
    readonly openWorldHint: true;
};
export declare function textResult(value: unknown): {
    content: {
        type: "text";
        text: string;
    }[];
};
export declare function apiErrorResult(): {
    content: {
        type: "text";
        text: string;
    }[];
};
//# sourceMappingURL=response.d.ts.map