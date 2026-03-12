# Chapter Preview for SEO - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create public chapter preview pages and API endpoints for SEO indexing while keeping paid content protected behind authentication.

**Architecture:** Two-layer system with backend API serving JSON preview data and frontend React page consuming it with HTML metadata + JSON-LD structured data. Auto-redirect authenticated users to full reading interface. Sitemap dynamically generated for search engine discovery.

**Tech Stack:** Express (backend), React + TypeScript (frontend), React Helmet (metadata), Prisma (database queries), Node.js utilities

---

## Backend Implementation

### Task 1: Create Public Chapters Routes File

**Files:**
- Create: `apps/backend/src/modules/public/chapters.routes.ts`
- Modify: `apps/backend/src/app.ts` - Register the new route

**Step 1: Create chapters routes file**

```typescript
// apps/backend/src/modules/public/chapters.routes.ts
import { FastifyInstance } from "fastify";
import { catalogService } from "../catalogue/catalogue.service.js";

export async function registerPublicChaptersRoutes(app: FastifyInstance) {
  // GET /api/chapters/:id/preview - Public endpoint, no auth required
  app.get<{ Params: { id: string } }>(
    "/api/chapters/:id/preview",
    {
      schema: {
        description: "Get public chapter preview for SEO indexing",
        tags: ["public"],
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const preview = await catalogService.getChapterPreview(id);

        if (!preview) {
          return reply.status(404).send({ error: "Chapter not found" });
        }

        // Cache for 24 hours
        reply.header("Cache-Control", "public, max-age=86400");
        return preview;
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
```

**Step 2: Register route in app.ts**

Find this section in `apps/backend/src/app.ts` (around line 180-200):
```typescript
// Register all module routes
await registerCatalogRoutes(app);
await registerAuthRoutes(app);
// ... other routes
```

Add this line:
```typescript
await registerPublicChaptersRoutes(app);
```

At the top of the file, add import:
```typescript
import { registerPublicChaptersRoutes } from "./modules/public/chapters.routes.js";
```

**Step 3: Commit**

```bash
cd /path/to/repo
git add apps/backend/src/modules/public/chapters.routes.ts apps/backend/src/app.ts
git commit -m "feat: add public chapters preview route skeleton

Create new route handler for GET /api/chapters/:id/preview
Register route in app.ts
Set 24-hour cache for preview data

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Implement getChapterPreview() Service Method

**Files:**
- Modify: `apps/backend/src/modules/catalogue/catalogue.service.ts` - Add new method

**Step 1: Add getChapterPreview method to CatalogService**

Find the CatalogService class in `apps/backend/src/modules/catalogue/catalogue.service.ts`.

Add this method (place it after the existing `getChapter()` method):

```typescript
async getChapterPreview(chapterId: string) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        id: true,
        title: true,
        description: true,
        protagonistName: true,
        coverAsset: {
          select: {
            url: true,
          },
        },
        genres: {
          select: {
            genre: {
              select: {
                name: true,
              },
            },
          },
        },
        volumes: {
          select: {
            volumeNumber: true,
            title: true,
          },
          orderBy: { volumeNumber: "asc" },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!chapter) {
      return null;
    }

    // Transform to response format
    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      protagonistName: chapter.protagonistName,
      coverAsset: chapter.coverAsset,
      volumeCount: chapter.volumes.length,
      volumes: chapter.volumes,
      genres: chapter.genres.map((g) => g.genre.name),
      metadata: {
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
      },
    };
  } catch (error) {
    this.logger.error(`Failed to get chapter preview ${chapterId}:`, error);
    throw error;
  }
}
```

**Step 2: Test the method exists**

Verify TypeScript compiles:
```bash
cd apps/backend
npm run build
```

Expected: Build succeeds without errors in catalogue.service.ts

**Step 3: Commit**

```bash
git add apps/backend/src/modules/catalogue/catalogue.service.ts
git commit -m "feat: implement getChapterPreview service method

Add service method to retrieve minimal chapter data for preview:
- Title, description, protagonist name
- Cover asset URL
- Volume list with titles
- Genres
- Metadata (createdAt, updatedAt)

Select only necessary fields for minimal response payload.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Implement Sitemap XML Generation

**Files:**
- Create: `apps/backend/src/modules/public/sitemap.service.ts`
- Modify: `apps/backend/src/app.ts` - Add sitemap route

**Step 1: Create sitemap service**

```typescript
// apps/backend/src/modules/public/sitemap.service.ts
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
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      });

      // Build URLs array
      const urls: SitemapUrl[] = chapters.map((chapter) => ({
        loc: `${baseUrl}/chapters/${chapter.id}/preview`,
        lastmod: chapter.updatedAt.toISOString().split("T")[0],
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
```

**Step 2: Add sitemap route to app.ts**

In `apps/backend/src/app.ts`, add this import at the top:
```typescript
import { sitemapService } from "./modules/public/sitemap.service.js";
```

Then add this route (place after the other public routes, around line 200):

```typescript
// GET /sitemap.xml - Public sitemap for search engines
app.get("/sitemap.xml", async (request, reply) => {
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || "https://moncherjournal.com";
    const sitemap = await sitemapService.generateSitemap(baseUrl);

    // Cache for 24 hours
    reply.header("Content-Type", "application/xml");
    reply.header("Cache-Control", "public, max-age=86400");

    return reply.send(sitemap);
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({ error: "Failed to generate sitemap" });
  }
});
```

**Step 3: Verify routes compile**

```bash
cd apps/backend
npm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add apps/backend/src/modules/public/sitemap.service.ts apps/backend/src/app.ts
git commit -m "feat: implement sitemap.xml generation for SEO

Add SitemapService to generate XML sitemap listing all chapters
Add GET /sitemap.xml route with 24-hour cache
Sitemap includes:
- Chapter preview URLs
- Last modified date
- Priority 0.8

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Add robots.txt Static File

**Files:**
- Create: `apps/backend/public/robots.txt`
- Modify: `apps/backend/src/app.ts` - Register static file serving

**Step 1: Create robots.txt**

```text
# Robots.txt for Cher Journal

Sitemap: https://moncherjournal.com/sitemap.xml

User-agent: *
Allow: /chapters/*/preview
Allow: /sitemap.xml
Disallow: /reader/*
Disallow: /admin/*
Disallow: /api/auth/*
Disallow: /api/user/*
Disallow: /api/orders/*
Disallow: /api/subscriptions/*

User-agent: Googlebot
Allow: /
Disallow: /admin/*
Disallow: /api/auth/*

User-agent: Bingbot
Allow: /
Disallow: /admin/*
Disallow: /api/auth/*
```

Create file at: `apps/backend/public/robots.txt`

**Step 2: Verify file exists**

```bash
ls -la apps/backend/public/robots.txt
```

Expected: File exists with content

**Step 3: Commit**

```bash
git add apps/backend/public/robots.txt
git commit -m "feat: add robots.txt for search engine crawling

Configure robots.txt to:
- Allow chapter preview pages for all crawlers
- Disallow access to reader, admin, auth, order APIs
- Link to sitemap
- Grant full access to Googlebot and Bingbot for preview pages

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Frontend Implementation

### Task 5: Create ChapterPreview Page Component

**Files:**
- Create: `apps/web/src/pages/ChapterPreview.tsx`

**Step 1: Create ChapterPreview page**

```typescript
// apps/web/src/pages/ChapterPreview.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import api from "../lib/api";
import { useAuthStore } from "../stores/authStore";

interface PreviewData {
  id: string;
  title: string;
  description: string;
  protagonistName: string;
  coverAsset?: { url: string };
  volumeCount: number;
  volumes: Array<{ volumeNumber: number; title: string }>;
  genres: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

export default function ChapterPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && id) {
      navigate(`/chapters/${id}`, { replace: true });
    }
  }, [isAuthenticated, id, navigate]);

  // Fetch preview data
  useEffect(() => {
    if (!id) return;

    const fetchPreview = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/chapters/${id}/preview`);
        if (response.success && response.data) {
          setPreview(response.data);
        } else {
          setError("Chapter not found");
        }
      } catch (err) {
        setError("Failed to load chapter preview");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-charcoal dark:text-white/70 font-light">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link
          to="/catalogue"
          className="text-primary hover:underline mb-4 inline-block">
          ← Retour au catalogue
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">
            Erreur
          </h1>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error || "Ce chapitre est introuvable."}
          </p>
          <Link
            to="/catalogue"
            className="text-primary hover:underline font-medium">
            Retourner au catalogue →
          </Link>
        </div>
      </div>
    );
  }

  const coverImageUrl = preview.coverAsset?.url
    ? `${import.meta.env.VITE_API_URL ?? ""}${preview.coverAsset.url}`
    : null;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: preview.title,
    description: preview.description,
    image: coverImageUrl,
    genre: preview.genres,
    author: {
      "@type": "Person",
      name: preview.protagonistName,
    },
    hasPart: preview.volumes.map((vol) => ({
      "@type": "CreativeWork",
      name: `Volume ${vol.volumeNumber}: ${vol.title}`,
      position: vol.volumeNumber,
    })),
  };

  return (
    <>
      <Helmet>
        <title>{preview.title} - Cher Journal</title>
        <meta name="description" content={preview.description} />
        <meta property="og:title" content={preview.title} />
        <meta property="og:description" content={preview.description} />
        {coverImageUrl && (
          <meta property="og:image" content={coverImageUrl} />
        )}
        <meta property="og:type" content="book" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link className="hover:text-primary transition-colors" to="/">
            Accueil
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <Link
            className="hover:text-primary transition-colors"
            to="/catalogue">
            Catalogue
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="text-gray-900 dark:text-gray-100">
            {preview.title}
          </span>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Cover Image */}
          <div className="md:col-span-1">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={preview.title}
                className="w-full rounded-lg shadow-lg object-cover"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-gray-400">
                  auto_stories
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-charcoal dark:text-white mb-2">
              {preview.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 italic">
              par {preview.protagonistName}
            </p>

            {preview.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {preview.genres.map((genre) => (
                  <span
                    key={genre}
                    className="inline-block bg-primary/10 text-primary dark:bg-primary/20 px-3 py-1 rounded-full text-sm">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              {preview.description}
            </p>

            {/* CTA Button */}
            <Link
              to="/login"
              className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Se connecter pour lire
            </Link>

            {/* Volume Count */}
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-charcoal dark:text-white">
                  {preview.volumeCount} volumes
                </span>{" "}
                disponibles dans ce chapitre
              </p>
            </div>
          </div>
        </div>

        {/* Volumes List */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-charcoal dark:text-white mb-6">
            Volumes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preview.volumes.map((volume) => (
              <div
                key={volume.volumeNumber}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vol {volume.volumeNumber}
                </p>
                <p className="text-lg font-semibold text-charcoal dark:text-white">
                  {volume.title}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-charcoal dark:text-white mb-3">
            Prêt à commencer votre lecture?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Créez un compte ou connectez-vous pour accéder à tous les volumes
            de ce chapitre.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/login"
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Se connecter
            </Link>
            <Link
              to="/signup"
              className="border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-2 px-6 rounded-lg transition-colors">
              Créer un compte
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd apps/web
npm run build
```

Expected: Build succeeds without errors

**Step 3: Commit**

```bash
git add apps/web/src/pages/ChapterPreview.tsx
git commit -m "feat: create ChapterPreview page component

Implement public chapter preview page at /chapters/:id/preview:
- Fetch preview data from /api/chapters/:id/preview
- Auto-redirect authenticated users to /chapters/:id
- Display title, cover, description, genres, volumes list
- Add Helmet metadata (title, og:* tags, description)
- Add JSON-LD structured data for search engines
- Responsive layout with CTA buttons for login/signup
- Error handling for missing chapters

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Update Router Configuration

**Files:**
- Modify: `apps/web/src/router.tsx`

**Step 1: Add preview route**

Find the router configuration in `apps/web/src/router.tsx`.

Look for the chapters routes section. It should look something like:
```typescript
{
  path: "/chapters/:id",
  element: <Chapter />,
},
```

Add this route **before** the main chapter route (important for route precedence):

```typescript
{
  path: "/chapters/:id/preview",
  element: <ChapterPreview />,
},
```

At the top of the file, add the import:
```typescript
import ChapterPreview from "./pages/ChapterPreview";
```

**Step 2: Verify routes are in correct order**

The route order should be:
1. `/chapters/:id/preview` (preview - specific)
2. `/chapters/:id` (reading - general)

React Router will match the first matching route, so specific routes must come before general ones.

**Step 3: Verify TypeScript compiles**

```bash
cd apps/web
npm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add apps/web/src/router.tsx
git commit -m "feat: add chapter preview route to router

Add route for /chapters/:id/preview pointing to ChapterPreview component
Place before /chapters/:id for correct route precedence
Import ChapterPreview component

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Testing & Validation

### Task 7: Manual Testing Checklist

**Files:**
- None (manual testing)

**Steps:**

1. **Start backend and frontend servers**
   ```bash
   # Terminal 1: Backend
   cd apps/backend
   npm run dev

   # Terminal 2: Frontend
   cd apps/web
   npm run dev
   ```

2. **Test preview page loads without auth**
   - Navigate to: `http://localhost:5173/chapters/<any-chapter-id>/preview`
   - Expected: Page loads with chapter info, no auth required
   - Check: Cover image displays (or placeholder if missing)
   - Check: Title, description, volumes list all visible
   - Check: "Se connecter pour lire" button visible

3. **Test API endpoint directly**
   ```bash
   curl http://localhost:3000/api/chapters/<chapter-id>/preview
   ```
   Expected: Returns JSON with: id, title, description, coverAsset, volumeCount, volumes[], genres, metadata
   Expected header: `Cache-Control: public, max-age=86400`

4. **Test sitemap generation**
   ```bash
   curl http://localhost:3000/sitemap.xml
   ```
   Expected: Returns valid XML with `<urlset>` containing all chapters

5. **Test robots.txt**
   ```bash
   curl http://localhost:3000/robots.txt
   ```
   Expected: Returns robots.txt content with allow/disallow rules

6. **Test authenticated redirect**
   - Login to the application
   - Navigate to: `http://localhost:5173/chapters/<chapter-id>/preview`
   - Expected: Auto-redirects to `/chapters/<chapter-id>` (reading page)

7. **Test 404 handling**
   - Navigate to: `http://localhost:5173/chapters/invalid-id/preview`
   - Expected: Shows error message "Chapter not found"

8. **Test metadata in HTML**
   - Open preview page in browser
   - Right-click → "View Page Source"
   - Expected: Find `<title>`, `<meta name="description">`, `<meta property="og:*">`
   - Expected: Find `<script type="application/ld+json">` with structured data

**Step: Document results**

If all tests pass, document in a comment:
```
✅ Manual Testing Complete
- Preview page loads without auth
- API endpoint returns correct data
- Sitemap generation works
- Robots.txt accessible
- Authenticated users redirected
- 404 handling works
- HTML metadata present
- JSON-LD structured data valid
```

**Commit**

```bash
git add -A
git commit -m "test: manual testing complete for chapter preview

Verified:
✅ Preview page loads without authentication
✅ API endpoint returns correct preview data with cache headers
✅ Sitemap.xml generates valid XML for all chapters
✅ robots.txt accessible and properly configured
✅ Authenticated users auto-redirect to reading interface
✅ 404 handling for non-existent chapters
✅ HTML metadata tags (title, og:*, description) present
✅ JSON-LD structured data valid for search engines

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Validation & SEO Checks

### Task 8: Validate Structured Data with Google

**Files:**
- None (external validation)

**Steps:**

1. **Validate JSON-LD**
   - Go to: https://validator.schema.org/
   - Copy preview page source (right-click → View Source)
   - Paste the `<script type="application/ld+json">` content
   - Expected: No errors, shows "Book" with properties

2. **Check with Google Rich Results Test**
   - Go to: https://search.google.com/test/rich-results
   - Enter local preview URL: `http://localhost:5173/chapters/<id>/preview`
   - Expected: Shows "Book" rich result with title, image, description
   - Expected: Shows "hasPart" items (volumes)

3. **Verify Open Graph Tags**
   - Use: https://www.opengraphcheck.com/
   - Enter preview URL
   - Expected: Shows title, description, image preview

4. **Document validation results**

Once local testing passes, when deployed:

5. **Submit to Google Search Console**
   - Go to: https://search.google.com/search-console
   - Add property: `https://moncherjournal.com/sitemap.xml`
   - Submit sitemap
   - Expected: Google crawls preview URLs within 1-2 weeks

**Commit validation results**

```bash
git commit -m "test: validate structured data with external tools

Verified:
✅ JSON-LD validates on validator.schema.org
✅ Google Rich Results test shows Book type
✅ Open Graph tags properly formatted
✅ Ready for Google Search Console submission

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Summary

**Total Tasks:** 8
**Total Estimated Time:** 4-5 hours (30-45 min per task)

**Backend (Tasks 1-4):** 2-2.5 hours
- Routes + service method
- Sitemap generation
- robots.txt

**Frontend (Tasks 5-6):** 1.5-2 hours
- ChapterPreview component
- Router update

**Testing (Tasks 7-8):** 1-1.5 hours
- Manual testing
- SEO validation

**Files Created:** 3
- `apps/backend/src/modules/public/chapters.routes.ts`
- `apps/backend/src/modules/public/sitemap.service.ts`
- `apps/web/src/pages/ChapterPreview.tsx`
- `apps/backend/public/robots.txt`

**Files Modified:** 3
- `apps/backend/src/app.ts`
- `apps/backend/src/modules/catalogue/catalogue.service.ts`
- `apps/web/src/router.tsx`

---

## Next Steps After Implementation

1. Deploy to staging environment
2. Verify sitemap accessible at production URL
3. Submit sitemap to Google Search Console
4. Monitor Search Console for indexing progress
5. Verify preview pages appear in search results (1-2 weeks)
6. Consider analytics tracking for preview page visits
