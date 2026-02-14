import prisma from '../../../lib/prisma';

const MOMENT_SELECTION_CONFIG_KEY = 'content.moment_selection_chapter_id';
const CONFIG_CATEGORY = 'CONTENT';

/**
 * Service for managing "Sélection du moment" (Featured chapter)
 * Stores the selected chapter ID in SystemConfig
 */
export class MomentSelectionService {
  /**
   * Get the chapter ID that is currently marked as "Sélection du moment"
   */
  async getMomentSelectionChapterId(): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({
      where: { key: MOMENT_SELECTION_CONFIG_KEY },
    });

    return config?.value || null;
  }

  /**
   * Set a chapter as "Sélection du moment"
   * Only one chapter can have this status at a time
   * @param chapterId - ID of the chapter to set as moment selection
   * @param updatedBy - ID of the admin making the change
   */
  async setMomentSelectionChapter(chapterId: string | null, updatedBy: string): Promise<void> {
    // Verify chapter exists if setting a new one
    if (chapterId) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
      });

      if (!chapter) {
        throw new Error('CHAPTER_NOT_FOUND');
      }
    }

    // Update or create the config
    await prisma.systemConfig.upsert({
      where: { key: MOMENT_SELECTION_CONFIG_KEY },
      create: {
        key: MOMENT_SELECTION_CONFIG_KEY,
        value: chapterId,
        category: CONFIG_CATEGORY,
        type: 'STRING',
        description: 'Chapter ID marked as "Sélection du moment" (featured chapter)',
        updatedBy,
      },
      update: {
        value: chapterId,
        updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Clear the moment selection (no chapter is featured)
   * @param updatedBy - ID of the admin making the change
   */
  async clearMomentSelection(updatedBy: string): Promise<void> {
    await this.setMomentSelectionChapter(null, updatedBy);
  }

  /**
   * Add isFavorite flag to chapters based on moment selection
   * @param chapters - Array of chapters to process
   * @returns Chapters with isFavorite flag added
   */
  async enrichChaptersWithFavoriteFlag(chapters: any[]): Promise<any[]> {
    const momentSelectionChapterId = await this.getMomentSelectionChapterId();

    return chapters.map(chapter => ({
      ...chapter,
      isFavorite: chapter.id === momentSelectionChapterId,
    }));
  }

  /**
   * Add isFavorite flag to a single chapter
   * @param chapter - Chapter to process
   * @returns Chapter with isFavorite flag added
   */
  async enrichChapterWithFavoriteFlag(chapter: any): Promise<any> {
    const momentSelectionChapterId = await this.getMomentSelectionChapterId();

    return {
      ...chapter,
      isFavorite: chapter.id === momentSelectionChapterId,
    };
  }
}

export default new MomentSelectionService();
