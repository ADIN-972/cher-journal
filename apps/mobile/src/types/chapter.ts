export interface Chapter {
  id: string;
  title: string;
  protagonistName: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'PUBLISHED';
  coverAssetId?: string;
  createdAt: string;
  publishedAt?: string;
  isArchived: boolean;
  scheduledFor?: string;
  description?: string;
  accroche_classic?: string;
  accroche_dark?: string;
  accroche_dark_collection?: string;
  accroche_love?: string;
  accroche_marketing?: string;
  niveau_danger: number;
  niveau_douceur: number;
  niveau_intensite: number;
  niveau_transformation: number;
}
