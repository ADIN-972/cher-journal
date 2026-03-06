export type StoryStep = 1 | 2 | 3 | 4 | 5;

export interface StoryFormData {
  // Step 1
  protagonistName: string;
  photoAssetIds: string[];

  // Step 2
  description: string;
  selectedGenres: string[];
  explicitLevel: 'ROMANTIQUE' | 'SUGGESTIF' | 'SENSUEL' | 'EXPLICITE' | 'TRES_EXPLICITE';

  // Step 3
  niveauIntensitee: number;
  niveauDouceur: number;
  niveauDanger: number;
  niveauTransformation: number;

  // Step 4
  storyEnding: 'HAPPY' | 'BITTERSWEET' | 'TRAGIC' | 'OPEN';
  storyEndingCustom?: string;
  volumeProposals: VolumeProposal[];

  // Step 5
  email: string;
  rgpdConsent: boolean;
  ccpaConsent: boolean;
}

export interface VolumeProposal {
  volumeNumber: number;
  proposedLocation: string;
  proposedOrientation: string;
  proposedTwist: string;
}
