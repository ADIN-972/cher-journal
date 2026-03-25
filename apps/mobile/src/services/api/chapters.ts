import api from './client';
import type { Chapter, Volume, ApiResponse } from '@/types';

// Base URL without /api suffix for static assets (uploads)
const API_ORIGIN = (
  process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com/api'
).replace(/\/api$/, '');

export interface VolumeText {
  id: string;
  volumeId: string;
  title: string;
  chapterId: string;
  chapterTitle: string;
  volumeNumber: number;
  perspective: string;
  content: string;
  illustrationUrl: string | null;
}

export interface ReviewData {
  chapterId: string;
  rating: number;
  reviewText: string;
}

export interface Review {
  id: string;
  userId: string;
  chapterId: string;
  rating: number;
  reviewText: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  chapter?: {
    id: string;
    title: string;
    protagonistName: string;
    coverUrl?: string;
    coverAsset?: {
      objectKey: string;
      mimeType: string;
    } | null;
  };
}

const getCoverData = (chapter: {
  coverAsset?: { objectKey?: string; mimeType?: string; url?: string } | null;
}) => {
  if (!chapter.coverAsset?.objectKey && !chapter.coverAsset?.url) return { coverUrl: undefined };
  return {
    coverUrl: chapter.coverAsset.objectKey
      ? `${API_ORIGIN}/uploads/${chapter.coverAsset.objectKey}`
      : `${API_ORIGIN}${chapter.coverAsset.url}`,
  };
};

export const reviewsAPI = {
  async createOrUpdate(data: ReviewData): Promise<Review> {
    const response = await api.post<ApiResponse<Review>>('/reviews', data);
    return response.data.data;
  },

  async getUserReview(chapterId: string): Promise<Review | null> {
    try {
      const response = await api.get<ApiResponse<Review>>(`/reviews/my-review/${chapterId}`);
      return response.data.data;
    } catch {
      return null;
    }
  },

  async getUserReviews(): Promise<Review[]> {
    const response = await api.get<ApiResponse<Review[]>>('/reviews/my-reviews');

    const revwz = response.data.data.map((review) => ({
      ...review,
      chapter: review.chapter
        ? {
            ...review.chapter,
            ...getCoverData(review.chapter),
          }
        : undefined,
    }));

    return revwz;
  },

  async deleteReview(chapterId: string): Promise<void> {
    await api.delete(`/reviews/${chapterId}`);
  },
};

// --- Purchases / Orders ---

export interface Purchase {
  id: string;
  date: string;
  itemTitle: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
}

export const ordersAPI = {
  async getUserOrders(): Promise<Purchase[]> {
    const response = await api.get<ApiResponse<Purchase[]>>('/orders');
    return response.data.data || [];
  },
};

// --- Promotions ---

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: 'PERCENT' | 'FIXED' | 'FREE';
  value?: number | null;
  scope: string;
  startsAt: string;
  endsAt: string;
  remainingUses: number | null;
  userRemainingUses: number | null;
  content?: {
    chapterId?: string;
    chapterTitle?: string;
    protagonistName?: string | null;
    chapterCoverUrl?: string;
    volumeNumber?: number;
  } | null;
}

export const promotionsAPI = {
  async getApplicable(): Promise<Promotion[]> {
    const response = await api.get<{ success: boolean; data: { promotions: Promotion[] } }>('/promotions/applicable');
    return response.data.data?.promotions || [];
  },

  async getApplied(): Promise<any[]> {
    const response = await api.get<{ success: boolean; data: { appliedPromotions: any[] } }>('/promotions/applied');
    return response.data.data?.appliedPromotions || [];
  },
};

// --- Support Claims ---

export interface SupportClaim {
  id: string;
  category: 'TECHNICAL' | 'BILLING' | 'CONTENT' | 'OTHER';
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNote?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface SupportClaimData {
  category: 'TECHNICAL' | 'BILLING' | 'CONTENT' | 'OTHER';
  subject: string;
  message: string;
}

export interface SupportMessage {
  id: string;
  role: 'USER' | 'ADMIN';
  content: string;
  createdAt: string;
}

export const supportAPI = {
  async submitClaim(data: SupportClaimData): Promise<SupportClaim> {
    const response = await api.post<ApiResponse<SupportClaim>>('/support/claim', data);
    return response.data.data;
  },

  async getMyClaims(): Promise<SupportClaim[]> {
    const response = await api.get<ApiResponse<SupportClaim[]>>('/support/my-claims');
    return response.data.data;
  },

  async getClaimMessages(claimId: string): Promise<SupportClaim & { messages: SupportMessage[] }> {
    const response = await api.get<ApiResponse<SupportClaim & { messages: SupportMessage[] }>>(
      `/support/claims/${claimId}/messages`
    );
    return response.data.data;
  },

  async addMessage(claimId: string, content: string): Promise<SupportMessage> {
    const response = await api.post<ApiResponse<SupportMessage>>(
      `/support/claims/${claimId}/messages`,
      { content }
    );
    return response.data.data;
  },
};

export interface CustomStoryRequest {
  id: string;
  protagonistName: string;
  description: string;
  selectedGenres: string[];
  explicitLevel: string;
  photoAssetIds: string[];
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  rejectionReason?: string;
  rejectionNotes?: string;
  submittedAt: string;
  createdAt: string;
}

export interface StoryFormData {
  protagonistName: string;
  photoAssetIds: string[];
  description: string;
  selectedGenres: string[];
  explicitLevel: 'ROMANTIQUE' | 'SUGGESTIF' | 'SENSUEL' | 'EXPLICITE' | 'TRES_EXPLICITE';
  niveauIntensitee: number;
  niveauDouceur: number;
  niveauDanger: number;
  niveauTransformation: number;
  storyEnding: 'HAPPY' | 'BITTERSWEET' | 'TRAGIC' | 'OPEN';
  storyEndingCustom?: string;
  volumeProposals: {
    volumeNumber: number;
    proposedLocation: string;
    proposedOrientation: string;
    proposedTwist: string;
  }[];
  email: string;
  rgpdConsent: boolean;
  ccpaConsent: boolean;
}

export const customStoriesAPI = {
  async getMyStories(): Promise<CustomStoryRequest[]> {
    const response = await api.get('/custom-stories');
    const data = response.data;
    return Array.isArray(data) ? data : data?.data || [];
  },

  async createAndSubmit(formData: StoryFormData): Promise<CustomStoryRequest> {
    // Create draft then submit
    const createRes = await api.post('/custom-stories', formData);
    const story = createRes.data?.data || createRes.data;
    // Submit for review
    await api.post(`/custom-stories/${story.id}/submit`);
    return story;
  },

  async cancelStory(storyId: string): Promise<void> {
    await api.delete(`/custom-stories/${storyId}`);
  },
};

function buildCoverUrl(objectKey?: string | null): string | undefined {
  return objectKey ? `${API_ORIGIN}/uploads/${objectKey}` : undefined;
}

// --- Muse Chapters ---

export interface MuseChapterEntry {
  id: string;
  chapter: {
    id: string;
    title: string;
    protagonistName: string;
    coverAsset: { objectKey?: string; url?: string; mimeType?: string } | null;
    status: string;
    publishedAt: string | null;
  };
  customStory: {
    id: string;
    protagonistName: string;
    status: string;
    submittedAt: string;
  } | null;
  promotion: {
    id: string;
    name: string;
    type: string;
    value: number | null;
    scope: string;
    isActive: boolean;
  } | null;
  createdAt: string;
}

export const museChaptersAPI = {
  async getMyMuseChapters(): Promise<MuseChapterEntry[]> {
    const response = await api.get<{ success: boolean; data: MuseChapterEntry[] }>(
      '/reader/my-muse-chapters'
    );
    return response.data.data || [];
  },
};

export const chaptersAPI = {
  async getChapters(): Promise<Chapter[]> {
    const response = await api.get<ApiResponse<Chapter[]>>('/chapters');
    const chaps = response.data.data.map((chapter) => ({
      ...chapter,
      ...getCoverData(chapter),
    }));

    return chaps;
  },

  async getChapter(id: string): Promise<Chapter & { volumes?: Volume[] }> {
    const response = await api.get<ApiResponse<Chapter & { volumes?: Volume[] }>>(
      `/chapters/${id}`
    );
    const chapter = response.data.data;
    const tmpData = {
      ...chapter,
      ...getCoverData(chapter),
    };

    return tmpData;
  },

  async getVolumes(chapterId: string): Promise<Volume[]> {
    const chapter = await chaptersAPI.getChapter(chapterId);
    return chapter.volumes || [];
  },

  async getVolumeText(
    volumeId: string,
    perspective: 'NARRATOR' | 'PROTAGONIST' = 'NARRATOR'
  ): Promise<VolumeText> {
    const response = await api.get<{ success: boolean; data: VolumeText }>(
      `/reader/volumes/${volumeId}/text?perspective=${perspective}`
    );
    return response.data.data;
  },
};

// --- Club Info ---

export interface ClubInfo {
  priceCents: number;
  currency: string;
  discountPercent: number;
}

export const clubInfoAPI = {
  async get(): Promise<ClubInfo> {
    const response = await api.get<ApiResponse<ClubInfo>>('/club-info');
    return response.data.data;
  },
};

// --- Pricing ---

export interface VolumePriceInfo {
  basePrice: number;
  finalPrice: number;
  hasAccess: boolean;
  canWait: boolean;
  waitDuration: number;
  volumeType: 'FREE_TO_READ' | 'PAYWALL' | 'EPILOGUE';
  promotion: {
    id: string;
    type: 'PERCENT' | 'FIXED' | 'FREE';
    value: number;
    discount: number;
  } | null;
}

export const pricingAPI = {
  async getVolumePrice(chapterId: string, volumeNumber: number): Promise<VolumePriceInfo> {
    const response = await api.get<ApiResponse<VolumePriceInfo>>(
      `/volumes/${chapterId}/${volumeNumber}/price`
    );
    return response.data.data;
  },
};

// --- Stripe Checkout ---

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export const stripeAPI = {
  async createCheckoutSession(data: {
    chapterId: string;
    type: 'VOLUME' | 'CHAPTER' | 'PERSPECTIVE';
    volumeNumber?: number;
    scopes?: string[];
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession> {
    const response = await api.post<ApiResponse<CheckoutSession>>(
      '/stripe/create-checkout-session',
      data
    );
    return response.data.data;
  },

  async createProtagonistCheckoutSession(data: {
    chapterId: string;
    type: 'VOLUME' | 'CHAPTER';
    volumeNumber?: number;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession> {
    const response = await api.post<ApiResponse<CheckoutSession>>(
      '/stripe/create-protagonist-checkout-session',
      data
    );
    return response.data.data;
  },
};
