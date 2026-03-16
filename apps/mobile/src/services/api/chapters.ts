import api from './client';
import type { Chapter, Volume } from '@/types';

export const chaptersAPI = {
  async getChapters(): Promise<Chapter[]> {
    const response = await api.get<Chapter[]>('/chapters');
    return response.data;
  },

  async getChapter(id: string): Promise<Chapter> {
    const response = await api.get<Chapter>(`/chapters/${id}`);
    return response.data;
  },

  async getVolumes(chapterId: string): Promise<Volume[]> {
    const response = await api.get<Volume[]>(`/chapters/${chapterId}/volumes`);
    return response.data;
  },

  async getVolume(chapterId: string, volumeNumber: number): Promise<Volume> {
    const response = await api.get<Volume>(`/chapters/${chapterId}/volumes/${volumeNumber}`);
    return response.data;
  },
};
