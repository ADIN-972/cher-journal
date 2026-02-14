import momentSelectionService from '../../reader/catalog/moment-selection.service';

/**
 * Service for managing content configuration for admins
 * Delegates to specific config services (e.g., moment selection)
 */
export class ContentConfigService {
  /**
   * Get the chapter ID that is currently marked as "Sélection du moment"
   */
  async getMomentSelectionChapterId(): Promise<string | null> {
    return momentSelectionService.getMomentSelectionChapterId();
  }

  /**
   * Set a chapter as "Sélection du moment"
   * @param chapterId - ID of the chapter to set as moment selection (null to clear)
   * @param updatedBy - ID of the admin making the change
   */
  async setMomentSelectionChapter(chapterId: string | null, updatedBy: string): Promise<void> {
    await momentSelectionService.setMomentSelectionChapter(chapterId, updatedBy);
  }
}

export default new ContentConfigService();
