interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseURL = "/api";

  async request<T = any>(
    method: string,
    path: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};

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

    // Only set Content-Type if we have data to send
    if (data) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
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

  async post<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
    return this.request("POST", path, data);
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

  async upload(path: string, formData: FormData): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: "POST",
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
