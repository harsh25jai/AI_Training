export declare class SDKError extends Error {
    statusCode: number;
    body: string;
    rawResponse: Response;
    constructor(message: string, response: Response, body?: string);
}
//# sourceMappingURL=sdkerror.d.ts.map