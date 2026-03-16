export type Perspective = 'NARRATOR' | 'PROTAGONIST';

export interface Volume {
  id: string;
  chapterId: string;
  volumeNumber: number;
  title: string;
  isFinalPaywall: boolean;
  illustrationAssetId?: string;
  createdAt: string;
  publishedAt?: string;
  isFree: boolean;
  status: 'DRAFT' | 'IN_PROGRESS' | 'PUBLISHED';
  charme: number;
  danger: number;
  douceur: number;
  intensite: number;
  isDarkCollection: boolean;
  mystere: number;
  transformation: number;
  xpAmeBase: number;
  xpFeuBase: number;
  xpOmbreBase: number;
}

export interface VolumeVersion {
  id: string;
  volumeId: string;
  perspective: Perspective;
  text?: string;
  textBlobId?: string;
  isAutoText: boolean;
  characterCount: number;
  createdAt: string;
}
