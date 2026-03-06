import { create } from 'zustand';
import { api } from '../lib/api';

interface CustomStory {
  id: string;
  protagonistName: string;
  description: string;
  selectedGenres: string[];
  explicitLevel: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  rejectionReason?: string;
  photoAssetIds: string[];
}

interface CustomStoryState {
  stories: CustomStory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStories: () => Promise<void>;
  cancelStory: (storyId: string) => Promise<void>;
  clearError: () => void;
}

export const useCustomStoryStore = create<CustomStoryState>((set) => ({
  stories: [],
  isLoading: false,
  error: null,

  /**
   * Fetch user's custom story requests
   */
  fetchStories: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get('/custom-stories');
      const stories = Array.isArray(response) ? response : response.data || [];

      set({
        stories,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors du chargement des demandes',
        isLoading: false,
      });
    }
  },

  /**
   * Cancel a custom story request
   */
  cancelStory: async (storyId: string) => {
    try {
      await api.delete(`/custom-stories/${storyId}`);

      // Remove story from state
      set((state) => ({
        stories: state.stories.filter((story) => story.id !== storyId),
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors de l\'annulation',
      });
      throw error;
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));

export default useCustomStoryStore;
