# Chapter Preview for SEO - Design Document

**Date**: 2026-03-12
**Status**: Approved
**Objective**: Create public chapter preview pages for SEO indexing while keeping content protected behind authentication.

---

## Overview

Implement a two-tier system:
1. **Public preview pages** (`/chapters/:id/preview`) - Indexable by search engines
2. **Public API endpoint** (`/api/chapters/:id/preview`) - For robot consumption
3. **Sitemap & metadata** - Structured data for Google indexing

Users must authenticate to read content, but search engines can discover and index chapter information.

---

## Architecture

### Frontend Routes

**Route 1: `/chapters/:id/preview` (Public React Page)**
- Accessible without authentication
- Displays: title, cover image, short description, volume list
- Contains HTML metadata tags and JSON-LD structured data
- CTA: "Sign in to read" / "Create account"
- Auto-redirects authenticated users to `/chapters/:id`

**Route 2: API `/api/chapters/:id/preview` (Public Endpoint)**
- No authentication required
- Response includes: id, title, description, protagonistName, coverAsset, volumeCount, volumes[], genres, metadata
- Cache: `Cache-Control: public, max-age=86400` (1 day)
- Returns 404 for non-existent chapters

**Route 3: `/sitemap.xml` (Backend Generated)**
- Lists all public chapter preview URLs
- Dynamically generated and cached
- Format: Standard XML sitemap protocol

---

## Metadata Strategy (Option 3: Full Coverage)

### HTML Meta Tags (React Helmet)
```html
<title>[Chapter Title] - Cher Journal</title>
<meta name="description" content="[Short description]" />
<meta property="og:title" content="[Chapter Title]" />
<meta property="og:description" content="[Short description]" />
<meta property="og:image" content="[Cover URL]" />
<meta property="og:type" content="book" />
<meta name="twitter:card" content="summary_large_image" />
```

### JSON-LD Structured Data (Schema.org)
```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "[Chapter Title]",
  "author": "[Author Name]",
  "image": "[Cover URL]",
  "description": "[Full description]",
  "genres": ["Romance", "Erotica"],
  "datePublished": "[Date]",
  "hasPart": [
    {
      "@type": "CreativeWork",
      "name": "Volume 1: [Title]",
      "position": 1
    },
    {
      "@type": "CreativeWork",
      "name": "Volume 2: [Title]",
      "position": 2
    }
  ]
}
```

### robots.txt Configuration
```
Sitemap: https://site.com/sitemap.xml

User-agent: *
Allow: /chapters/*/preview
Allow: /sitemap.xml
Disallow: /reader/*
Disallow: /admin/*
Disallow: /api/auth/*
Disallow: /api/user/*
```

---

## Data Display

### Minimum Content (Approved)
- Chapter title
- Cover image (or placeholder if missing)
- Short description (max 2-3 sentences)
- Volume count
- List of volumes with numbers and titles only
- Genres (if available)

### Not Displayed
- Volume synopses (kept private)
- Pricing information
- User reviews/ratings
- Purchase buttons or pricing details

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Non-existent chapter | Show 404 error, link to catalog |
| API fetch fails | Show error message with retry button |
| User already authenticated | Auto-redirect to `/chapters/:id` |
| Missing cover image | Show placeholder with book icon |
| Partial data | Display available info with empty states |

---

## Implementation Files

### Backend

**New/Modified Routes:**
- `src/modules/public/chapters.routes.ts` - New: GET `/api/chapters/:id/preview`
- `src/modules/catalogue/catalogue.service.ts` - New: `getChapterPreview(id)`
- `src/app.ts` - Add route for `/sitemap.xml` and static `robots.txt`

**Sitemap Generation:**
- Implement dynamic sitemap generation in `src/modules/public/` or as a service
- Cache the sitemap (refresh on chapter creation/update)
- Include all chapters with lastmod date

### Frontend

**New Pages:**
- `src/pages/ChapterPreview.tsx` - Main preview page component (~250 lines)
- `src/components/ChapterPreviewContent.tsx` - Reusable preview content component

**New Utilities:**
- `src/lib/metaTags.ts` - Helmet configuration generator
- `src/lib/jsonLd.ts` - JSON-LD schema builder

**Routing:**
- `src/router.tsx` - Add route: `path: "/chapters/:id/preview"`

### Static Files
- `public/robots.txt` - Robot access rules
- No sitemap file needed (generated dynamically)

---

## User Flow

### Non-Authenticated User
1. Googles "Cher Journal Ursula" → finds `/chapters/:id/preview` in results
2. Clicks link → sees beautiful preview page with cover + description
3. Clicks "Sign in to read" → redirected to login
4. After login → redirected to `/chapters/:id` (full reading experience)

### Authenticated User
1. Accesses `/chapters/:id/preview` directly or via link
2. App detects authentication → auto-redirects to `/chapters/:id`
3. User sees normal chapter page with reading interface

---

## Testing Strategy

### Manual Testing
- [ ] Preview page loads without authentication
- [ ] Metadata tags present in HTML
- [ ] JSON-LD valid (use Google's Structured Data Testing Tool)
- [ ] Auto-redirect works for authenticated users
- [ ] Cover images load correctly
- [ ] Volume list displays properly
- [ ] Mobile responsive layout works
- [ ] 404 handling for non-existent chapters

### Automated Testing
- Unit tests for `getChapterPreview()` service
- Integration tests for `/api/chapters/:id/preview` endpoint
- Sitemap generation validation

### SEO Validation
- Submit sitemap to Google Search Console
- Verify pages appear in Google index after 1-2 weeks
- Check Search Console for any indexing errors

---

## Performance Considerations

- API endpoint cached: 24 hours
- Sitemap cached: 24 hours (regenerate on chapter changes)
- No database calls for authenticated check (use token)
- Minimal dependencies: no heavy libraries for preview rendering

---

## Future Enhancements (Out of Scope)

- Add sample content preview (first few paragraphs)
- Display author/creator information
- Add reader reviews/ratings to preview
- Integration with social media crawlers (Pinterest, etc.)
- Breadcrumb structured data
- AMP version for mobile previews

---

## Success Criteria

✅ Chapter preview pages are publicly accessible and crawlable
✅ Google Search Console shows indexed preview pages
✅ Structured data validates without errors
✅ Authenticated users auto-redirected to reading interface
✅ No exposed paid content on preview pages
✅ Sitemap updates automatically when chapters change
✅ Mobile layout is responsive and beautiful
