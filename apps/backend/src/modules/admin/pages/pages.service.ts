import prisma from '../../../lib/prisma';
import { CreatePageInput, UpdatePageOrderInput } from './pages.schemas';

export class PagesService {
  async listByVersion(volumeVersionId: string) {
    return prisma.versionAsset.findMany({
      where: { volumeVersionId },
      include: { chapterAsset: true },
      orderBy: { assetOrder: 'asc' },
    });
  }

  async create(data: CreatePageInput) {
    return prisma.versionAsset.create({
      data,
      include: { chapterAsset: true },
    });
  }

  async delete(id: string) {
    await prisma.versionAsset.delete({
      where: { id },
    });
  }

  async updateOrder(data: UpdatePageOrderInput) {
    await prisma.$transaction(
      data.pages.map(page =>
        prisma.versionAsset.update({
          where: { id: page.id },
          data: { assetOrder: page.assetOrder },
        })
      )
    );
  }
}
