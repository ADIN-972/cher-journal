interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL?: string) {
    // Use VITE_API_URL from environment, fallback to /api
    this.baseURL = baseURL || import.meta.env.VITE_API_URL || "/api";
  }

  async request<T = any>(
    method: string,
    path: string,
    data?: any,
    params?: Record<string, any>,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = { 'X-App': 'admin', ...customHeaders };

    // Build URL with query params
    let url = `${this.baseURL}${path}`;
    if (params) {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      });
      const qs = queryString.toString();
      if (qs) {
        url += `?${qs}`;
      }
    }

    // Only set Content-Type for JSON data (not FormData)
    if (data && !(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
    });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      // If JSON parsing fails, create a generic error
      throw new Error(
        `Request failed with status ${response.status}: ${response.statusText}`
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.error?.message ||
          result?.message ||
          `Request failed with status ${response.status}`
      );
    }

    return result;
  }

  async get<T = any>(
    path: string,
    options?: { params?: Record<string, any> }
  ): Promise<ApiResponse<T>> {
    return this.request("GET", path, undefined, options?.params);
  }

  async post<T = any>(
    path: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request("POST", path, data, undefined, options?.headers);
  }

  async put<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
    return this.request("PUT", path, data);
  }

  async patch<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
    return this.request("PATCH", path, data);
  }

  async delete<T = any>(path: string): Promise<ApiResponse<T>> {
    return this.request("DELETE", path);
  }

  /**
   * Download file as blob (for CSV, PDF, etc.)
   */
  async download(path: string, accept?: string): Promise<Blob> {
    const url = `${this.baseURL}${path}`;
    const headers: Record<string, string> = { 'X-App': 'admin' };

    if (accept) {
      headers["Accept"] = accept;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    return response.blob();
  }

  async upload(path: string, formData: FormData): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: "POST",
      headers: { 'X-App': 'admin' },
      credentials: "include",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Upload failed");
    }

    return result;
  }
}

export const api = new ApiClient();
export default api;
