import { HTTPClient, matchResponse, matchStatusCode, unpackHeaders } from "./http";
import { SecurityState, resolveSecurity, resolveGlobalSecurity } from "./security";
import { pathToFunc } from "./url";
export type RequestOptions = {
    fetchOptions?: Omit<RequestInit, "method" | "body">;
};
type RequestConfig = {
    method: string;
    path: string;
    baseURL?: string | URL;
    query?: string;
    body?: RequestInit["body"];
    headers?: HeadersInit;
    security?: SecurityState | null;
};
export declare class ClientSDK {
    #private;
    protected readonly baseURL: URL;
    constructor(init: {
        client: HTTPClient;
        baseURL: URL;
    });
    protected fetch$(conf: RequestConfig, options?: RequestOptions): Promise<Response>;
    protected unpackHeaders: typeof unpackHeaders;
    protected matchStatusCode: typeof matchStatusCode;
    protected matchResponse: typeof matchResponse;
    protected templateURLComponent: typeof pathToFunc;
    protected resolveSecurity: typeof resolveSecurity;
    protected resolveGlobalSecurity: typeof resolveGlobalSecurity;
}
export {};
//# sourceMappingURL=sdks.d.ts.map