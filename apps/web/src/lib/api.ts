/**
 * API Client with JWT token management
 */

import { ApplicablePromotion, SubscriptionData } from '@cher-journal/types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get JWT token from localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Set JWT token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Remove JWT token from localStorage
   */
  clearToken(): void {
    localStorage.removeItem('token');
  }

  /**
   * Build headers with optional authentication
   */
  private buildHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[API] Token found and added to headers');
      } else {
        console.warn('[API] No token found in localStorage');
      }
    }

    return headers;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Important: send cookies with requests
      headers: {
        ...this.buildHeaders(includeAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      // Parse JSON response
      const data = await response.json();

      if (!response.ok) {
        // Handle both error formats: { error: { message: "..." } } and { message: "..." }
        const errorMessage = data.error?.message || data.message || data.error || 'Request failed';
        const error = new Error(errorMessage);
        // Preserve error code for centralized message system
        if (data.error?.code) {
          (error as any).code = data.error.code;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * HTTP Methods
   */
  async get<T = any>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async put<T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async patch<T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async delete<T = any>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  /**
   * Upload files with FormData
   */
  async upload<T = any>(endpoint: string, formData: FormData, includeAuth: boolean = true): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {};
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error?.message || data.message || data.error || 'Upload failed';
        const error = new Error(errorMessage);
        if (data.error?.code) {
          (error as any).code = data.error.code;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Upload request failed:', error);
      throw error;
    }
  }

  /**
   * Authentication endpoints
   */
  async login(email: string, password: string): Promise<{ user: any }> {
    // Backend sets session cookie automatically (httpOnly)
    const response = await this.post<{ success: boolean; data: { user: any } }>(
      '/auth/login',
      { email, password },
      false
    );

    return { user: response.data.user };
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<{ user: any }> {
    // Register user (backend doesn't create session automatically)
    const registerResponse = await this.post<{ success: boolean; data: { user: any } }>(
      '/auth/register',
      { email, password, firstName, lastName },
      false
    );

    // Automatically login after registration to create session cookie
    await this.login(email, password);

    return { user: registerResponse.data.user };
  }

  async getProfile(): Promise<any> {
    const response = await this.get<{ success: boolean; data: { user: any } }>('/auth/me');
    return response.data.user;
  }

  async logout(): Promise<void> {
    try {
      await this.post<{ success: boolean; data: { message: string } }>('/auth/logout', {});
    } catch (error) {
      // Log error but don't throw - logout should still proceed to clear local state
      console.error('Logout API request failed:', error);
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await this.post<{ success: boolean; data: { message: string } }>(
      '/auth/forgot-password',
      { email },
      false
    );
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await this.post<{ success: boolean; data: { message: string } }>(
      '/auth/reset-password',
      { token, password },
      false
    );
    return response.data;
  }

  /**
   * Catalog endpoints
   */
  async getChapters(): Promise<any[]> {
    const response = await this.get<{ success: boolean; data: any[] }>('/chapters');
    return response.data;
  }

  async getChapter(id: string): Promise<any> {
    const response = await this.get<{ success: boolean; data: any }>(`/chapters/${id}`);
    return response.data;
  }

  /**
   * Library endpoints
   */
  async getLibrary(): Promise<any> {
    const response = await this.get<{ success: boolean; data: any }>('/library');
    return response.data;
  }

  /**
   * Review endpoints
   */
  async createOrUpdateReview(data: {
    chapterId: string;
    rating: number;
    reviewText: string;
  }): Promise<any> {
    const response = await this.post<{ success: boolean; data: any }>('/reviews', data);
    return response.data;
  }

  async getUserReview(chapterId: string): Promise<any> {
    const response = await this.get<{ success: boolean; data: any }>(`/reviews/my-review/${chapterId}`);
    return response.data;
  }

  async getChapterReviews(chapterId: string): Promise<any[]> {
    const response = await this.get<{ success: boolean; data: any[] }>(`/reviews/chapter/${chapterId}`);
    return response.data;
  }

  async getChapterReviewStats(chapterId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const response = await this.get<{ success: boolean; data: any }>(`/reviews/chapter/${chapterId}/stats`);
    return response.data;
  }

  async deleteReview(chapterId: string): Promise<{ success: boolean }> {
    const response = await this.delete<{ success: boolean; data: { success: boolean } }>(`/reviews/${chapterId}`);
    return response.data;
  }

  /**
   * Reader endpoints
   */
  async getVolumeVersion(versionId: string): Promise<any> {
    return this.get(`/reader/volume-version?versionId=${versionId}`);
  }

  async getVolumeText(volumeId: string, perspective: 'NARRATOR' | 'PROTAGONIST' = 'NARRATOR'): Promise<{
    id: string;
    volumeId: string;
    title: string;
    chapterId: string;
    chapterTitle: string;
    volumeNumber: number;
    perspective: string;
    content: string;
    illustrationUrl: string | null;
  }> {
    const response = await this.get<{ success: boolean; data: any }>(`/reader/volumes/${volumeId}/text?perspective=${perspective}`);
    return response.data;
  }

  async renderVolume(versionId: string, perspective?: 'narrator' | 'protagonist'): Promise<any> {
    const queryParams = new URLSearchParams({
      versionId: versionId,
      ...(perspective && { perspective })
    });
    return this.get(`/reader/volume-versions/${versionId}/render?${queryParams}`);
  }

  /**
   * Wait-to-Read endpoints
   */
  async startWait(data: { chapterId: string; volumeNumber: number }): Promise<{
    unlocksAt: string;
    remainingMs: number;
  }> {
    return this.post('/wait/start', data);
  }

  async getWaitStatus(data: { chapterId: string; volumeNumber: number }): Promise<{
    isActive: boolean;
    unlocksAt?: string;
    remainingMs?: number;
  }> {
    return this.post('/wait/status', data);
  }

  async getActiveWaits(): Promise<any[]> {
    const response = await this.get<{ success: boolean; data: any[] }>('/wait/active');
    return response.data;
  }

  async getCompletedWaits(): Promise<any[]> {
    const response = await this.get<{ success: boolean; data: any[] }>('/wait/completed');
    return response.data;
  }

  async getAllWaits(): Promise<any[]> {
    const response = await this.get<{ success: boolean; data: any[] }>('/wait/all');
    return response.data;
  }

  async markCanStartWait(data: { chapterId: string; volumeNumber: number }): Promise<{ success: boolean }> {
    return this.post('/reader/mark-can-start-wait', data);
  }

  /**
   * Configuration endpoints
   */
  async getWaitConfig(): Promise<{ maxSimultaneousTimers: number }> {
    const response = await this.get<{ success: boolean; data: { maxSimultaneousTimers: number } }>('/config/wait', false);
    return response.data;
  }

  /**
   * Pricing endpoints
   */
  async getVolumePrice(volumeId: string): Promise<any> {
    return this.get(`/prices/volume/${volumeId}`);
  }

  /**
   * Stripe/Payment endpoints
   */
  async createCheckoutSession(data: {
    chapterId: string;
    type: 'CHAPTER' | 'PREORDER' | 'BUNDLE' | 'COLORING' | 'VERSION_PACK' | 'VOLUME' | 'PERSPECTIVE';
    volumeNumber?: number;  // For VOLUME and PERSPECTIVE type orders
    scopes?: string[];
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; url: string }> {
    const response = await this.post<{ success: boolean; data: { sessionId: string; url: string } }>(
      '/stripe/create-checkout-session',
      data
    );
    return response.data;
  }

  /**
   * Create checkout session for PROTAGONIST purchases (uses dedicated endpoint)
   * Always uses scopes=['BASE','POV'] and priceProtagonistUnlock pricing
   */
  async createProtagonistCheckoutSession(data: {
    chapterId: string;
    type: 'CHAPTER' | 'VOLUME';
    volumeNumber?: number;  // For VOLUME type orders
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; url: string }> {
    const response = await this.post<{ success: boolean; data: { sessionId: string; url: string } }>(
      '/stripe/create-protagonist-checkout-session',
      data
    );
    return response.data;
  }

  /**
   * Promotions endpoints
   */
  async getApplicablePromotions(): Promise<ApplicablePromotion[]> {
    const response = await this.get<{ success: boolean; data: { promotions: ApplicablePromotion[] } }>('/promotions/applicable');
    return response.data.promotions;
  }

  async getAppliedPromotions(): Promise<any[]> {
    const response = await this.get<{ success: boolean; data: { appliedPromotions: any[] } }>('/promotions/applied');
    return response.data.appliedPromotions;
  }

  async usePromotion(promotionId: string, selectedRefId?: string): Promise<{
    success: boolean;
    promotion: { id: string; name: string; type: string; value: number | null };
    message: string;
  }> {
    const response = await this.post<{
      success: boolean;
      data: { success: boolean; promotion: any; message: string };
    }>(`/promotions/use/${promotionId}`, { selectedRefId });
    return response.data;
  }

  /**
   * Update reading progress for a volume
   */
  async updateProgress(data: {
    chapterId: string;
    volumeNumber: number;
    progress: number;
    perspective?: 'NARRATOR' | 'PROTAGONIST';
  }): Promise<{ success: boolean; progress: number }> {
    return this.post('/reader/update-progress', data);
  }

  /**
   * Get user's purchase history
   */
  async getUserOrders(): Promise<any[]> {
    const response = await this.get<{ success: boolean; data: any[] }>('/orders');
    return response.data;
  }

  /**
   * Submit a support claim
   */
  async submitSupportClaim(data: {
    category: 'technical' | 'billing' | 'content' | 'other';
    subject: string;
    message: string;
  }): Promise<any> {
    const mappedCategory = data.category.toUpperCase() as 'TECHNICAL' | 'BILLING' | 'CONTENT' | 'OTHER';
    const response = await this.post<{ success: boolean; data: any }>(
      '/support/claim',
      {
        category: mappedCategory,
        subject: data.subject,
        message: data.message,
      }
    );
    return response.data;
  }

  /**
   * Get user's support claims
   */
  async getUserSupportClaims(): Promise<any[]> {
    const response = await this.get<{ success: boolean; data: any[] }>('/support/my-claims');
    return response.data;
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(): Promise<any[]> {
    const response = await this.get<{ success: boolean; data: any[] }>('/reviews/my-reviews');
    return response.data;
  }

  /**
   * Get current user's subscription status (null if no subscription)
   */
  async getUserSubscription(): Promise<any | null> {
    const response = await this.get<{ success: boolean; data: any | null }>('/me/subscription');
    return response.data;
  }

  /**
   * Create a Stripe Checkout session for subscription purchase
   */
  async createSubscriptionCheckout(
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string | null }> {
    const response = await this.post<{ success: boolean; data: { sessionId: string; url: string | null } }>(
      '/stripe/create-subscription-checkout',
      { successUrl, cancelUrl }
    );
    return response.data;
  }

  /**
   * Cancel the current user's subscription at period end
   */
  async cancelSubscription(): Promise<any> {
    const response = await this.post<{ success: boolean; data: any }>(
      '/me/subscription/cancel',
      {}
    );
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
export default api;
