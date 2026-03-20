import prisma from "../../../lib/prisma";
import { AssignMuseInput, UpdateMuseInput } from "./chapter-muse.schemas";

export class ChapterMuseService {
  async assignMuse(data: AssignMuseInput) {
    // Check if chapter already has a muse
    const existing = await prisma.chapterMuse.findUnique({
      where: { chapterId: data.chapterId },
    });

    if (existing) {
      throw new Error("CHAPTER_ALREADY_HAS_MUSE");
    }

    return prisma.chapterMuse.create({
      data: {
        chapterId: data.chapterId,
        userId: data.userId,
        customStoryId: data.customStoryId,
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        customStory: true,
        promotion: true,
      },
    });
  }

  async removeMuse(chapterId: string) {
    const existing = await prisma.chapterMuse.findUnique({
      where: { chapterId },
    });

    if (!existing) {
      throw new Error("MUSE_NOT_FOUND");
    }

    return prisma.chapterMuse.delete({
      where: { chapterId },
    });
  }

  async getMuseByChapter(chapterId: string) {
    const muse = await prisma.chapterMuse.findUnique({
      where: { chapterId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        customStory: true,
        promotion: true,
      },
    });

    if (!muse) {
      throw new Error("MUSE_NOT_FOUND");
    }

    return muse;
  }

  async getMusesByUser(userId: string) {
    return prisma.chapterMuse.findMany({
      where: { userId },
      include: {
        chapter: true,
        customStory: true,
        promotion: true,
      },
    });
  }

  async updateMuse(chapterId: string, data: UpdateMuseInput) {
    const existing = await prisma.chapterMuse.findUnique({
      where: { chapterId },
    });

    if (!existing) {
      throw new Error("MUSE_NOT_FOUND");
    }

    return prisma.chapterMuse.update({
      where: { chapterId },
      data: {
        customStoryId: data.customStoryId,
        promotionId: data.promotionId,
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        customStory: true,
        promotion: true,
      },
    });
  }
}
