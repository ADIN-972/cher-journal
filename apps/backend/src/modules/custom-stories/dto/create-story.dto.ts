export class CreateStoryDto {
  protagonistName!: string;
  description!: string;
  selectedGenres!: string[];
  explicitLevel!: 'ROMANTIQUE' | 'SUGGESTIF' | 'SENSUEL' | 'EXPLICITE' | 'TRES_EXPLICITE';
  niveauIntensitee!: number;
  niveauDouceur!: number;
  niveauDanger!: number;
  niveauTransformation!: number;
  storyEnding!: 'HAPPY' | 'BITTERSWEET' | 'TRAGIC' | 'OPEN';
  storyEndingCustom?: string;
  email!: string;
  rgpdConsent!: boolean;
  ccpaConsent!: boolean;
  photoAssetIds!: string[];
  volumeProposals!: Array<{
    volumeNumber: number;
    proposedLocation: string;
    proposedOrientation: string;
    proposedTwist: string;
  }>;
}

export class UpdateStoryDto {
  protagonistName?: string;
  description?: string;
  selectedGenres?: string[];
  explicitLevel?: 'ROMANTIQUE' | 'SUGGESTIF' | 'SENSUEL' | 'EXPLICITE' | 'TRES_EXPLICITE';
  niveauIntensitee?: number;
  niveauDouceur?: number;
  niveauDanger?: number;
  niveauTransformation?: number;
  storyEnding?: 'HAPPY' | 'BITTERSWEET' | 'TRAGIC' | 'OPEN';
  storyEndingCustom?: string;
  email?: string;
  photoAssetIds?: string[];
  volumeProposals?: Array<{
    volumeNumber: number;
    proposedLocation: string;
    proposedOrientation: string;
    proposedTwist: string;
  }>;
}
