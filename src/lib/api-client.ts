
interface ApiClientOptions extends RequestInit {
    data?: unknown;
    params?: Record<string, string>;
}

export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public data?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const apiClient = async <T = unknown>(
    endpoint: string,
    { data, params, headers: customHeaders, ...customConfig }: ApiClientOptions = {}
): Promise<T> => {
    const headers = {
        'Content-Type': 'application/json',
        ...(customHeaders as Record<string, string>),
    };

    let url = endpoint;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    const config: RequestInit = {
        method: data ? 'POST' : 'GET',
        body: data ? JSON.stringify(data) : undefined,
        headers,
        ...customConfig,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorMessage = 'An error occurred';
            let errorData;
            try {
                errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
                // Ignore if not JSON
            }
            throw new ApiError(response.status, errorMessage, errorData);
        }

        // Return null for 204 No Content
        if (response.status === 204) {
            return null as T;
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network errors or other unexpected errors
        throw new Error(error instanceof Error ? error.message : 'Network Error');
    }
};

export const api = {
    get: <T>(url: string, options?: ApiClientOptions) => apiClient<T>(url, { method: 'GET', ...options }),
    post: <T>(url: string, data: unknown, options?: ApiClientOptions) => apiClient<T>(url, { method: 'POST', data, ...options }),
    patch: <T>(url: string, data: unknown, options?: ApiClientOptions) => apiClient<T>(url, { method: 'PATCH', data, ...options }),
    delete: <T>(url: string, options?: ApiClientOptions) => apiClient<T>(url, { method: 'DELETE', ...options }),
};
