import prisma from "../../lib/prisma.js";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  priority: string;
}

export class SitemapService {
  async generateSitemap(baseUrl: string): Promise<string> {
    try {
      // Get all chapters
      const chapters = await prisma.chapter.findMany({
        select: {
          id: true,
          publishedAt: true,
          createdAt: true,
        },
        orderBy: { publishedAt: "desc" },
      });

      // Build URLs array
      const urls: SitemapUrl[] = chapters.map((chapter) => ({
        loc: `${baseUrl}/chapters/${chapter.id}/preview`,
        lastmod: (chapter.publishedAt || chapter.createdAt).toISOString().split("T")[0],
        priority: "0.8",
      }));

      // Generate XML
      return this.buildSitemapXml(urls);
    } catch (error) {
      console.error("Failed to generate sitemap:", error);
      throw error;
    }
  }

  private buildSitemapXml(urls: SitemapUrl[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const urlset = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const urlsXml = urls
      .map(
        (url) =>
          `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <priority>${url.priority}</priority>\n  </url>\n`
      )
      .join("");
    const urlsetClose = "</urlset>";

    return xmlHeader + urlset + urlsXml + urlsetClose;
  }
}

export const sitemapService = new SitemapService();
