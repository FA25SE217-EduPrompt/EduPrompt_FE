import {isAxiosError} from "axios";
import type {BaseResponse, ErrorPayload} from "@/types/api";

/**
 * Standard shape returned by this helper:
 * - resolves to BaseResponse<T> on success or on handled error shape
 * - never throws (caller can rely on returned BaseResponse)
 */

/**
 * Build ErrorPayload in a consistent way from AxiosError or other errors
 */
export function normalizeAxiosError(err: unknown): ErrorPayload {
    const fallbackMessage = err instanceof Error ? err.message : 'Unknown error';
    const defaultPayload: ErrorPayload = {code: 'INTERNAL_SERVER_ERROR', messages: [fallbackMessage], status: '500'};

    if (!isAxiosError(err) || !err.response) return defaultPayload;

    const resp = err.response;
    const data = resp.data;

    // If backend uses envelope { data: null, error: { code, messages, status } }
    if (data && data.error && typeof data.error === 'object') {
        const apiError = data.error as ErrorPayload & { message?: string | string[] };
        if (!apiError.messages && apiError.message) {
            const normalizedMessages = Array.isArray(apiError.message)
                ? apiError.message
                : [String(apiError.message)];
            return {
                code: apiError.code,
                messages: normalizedMessages,
                status: apiError.status,
            };
        }
        return apiError as ErrorPayload;
    }

    // Otherwise build a payload from available info
    const messages: string[] = [];
    if (data && typeof data === 'string') messages.push(data);
    if (data && data.message) {
        if (Array.isArray(data.message)) {
            messages.push(...data.message.map((m: unknown) => String(m)));
        } else {
            messages.push(String(data.message));
        }
    }
    if (!messages.length && resp.statusText) messages.push(resp.statusText);

    return {
        code: `HTTP_${resp.status}`,
        messages,
        status: String(resp.status),
    };
}


/**
 * Normalizes axios response data to BaseResponse format
 * Handles both cases: response is already BaseResponse<T> or raw data T
 */
function normalizeResponse<T>(data: unknown): BaseResponse<T> {
    // If response is already a BaseResponse (has 'data' or 'error' property)
    if (data && typeof data === 'object' && ('data' in data || 'error' in data)) {
        return data as BaseResponse<T>;
    }
    // Otherwise wrap raw data in BaseResponse
    return {data: data as T, error: null};
}

/**
 * ApiCall: Run an axios call function and return a safe BaseResponse<T>
 *
 * Supports two usage patterns:
 * 1. Function that returns Promise<AxiosResponse> - normalizes response automatically
 * 2. Backward compatible with existing code
 *
 * @param fn - function that returns a Promise resolving to AxiosResponse
 * @param opts - optional object { logger?: (msg, ...args) => void, rethrow?: boolean }
 */
export async function ApiCall<T>(
    fn: () => Promise<{ data: unknown }>,
    opts?: { logger?: (...args: unknown[]) => void; rethrow?: boolean }
): Promise<BaseResponse<T>> {
    const logger = opts?.logger ?? console.error;

    try {
        const res = await fn();
        return normalizeResponse<T>(res.data);
    } catch (error) {
        const errPayload = normalizeAxiosError(error);
        logger("[ApiCall] error:", errPayload, error);
        if (opts?.rethrow) throw error;
        return {data: null, error: errPayload};
    }
}

export default ApiCall;
