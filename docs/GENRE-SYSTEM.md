# Chapter Genre System Documentation

## Overview

The chapter genre system allows each chapter to be tagged with one or more genres from a predefined list. This enables better content categorization, filtering, and discovery across the platform.

## Database Schema

### ChapterGenre Enum

A chapter can be tagged with any of the following genres:

- **PASSIONS_CHARNELLES** - Erotic/Sensual: Explicit sexual content and raw desire
- **ROMANCES_TENDRES** - Sweet Romance: Emotional, tender love stories
- **MYSTERIES_SENSUELS** - Sensual Mystery: Intrigue with sensual undertones
- **INTERDITS** - Forbidden: Taboo relationships and transgressive themes
- **CONQUETES** - Seduction/Conquest: Games of seduction and power dynamics
- **REVES_SECRETS** - Secret Dreams: Fantasy and escapism
- **PASSION_BRUTALE** - Raw Passion: Intense and unfiltered desire
- **AMOUR_COMPLIQUE** - Complicated Love: Complex emotional entanglements
- **DESIR_NOCTURNE** - Nocturnal Desire: Night-themed erotic scenarios
- **LIBERATION** - Liberation: Themes of sexual freedom and self-discovery

### ChapterGenreTag Model

```prisma
model ChapterGenreTag {
  id        String        @id @default(uuid())
  chapterId String
  genre     ChapterGenre
  createdAt DateTime      @default(now())
  chapter   Chapter       @relation(fields: [chapterId], references: [id], onDelete: Cascade)

  @@unique([chapterId, genre])
  @@index([chapterId])
  @@index([genre])
  @@map("chapter_genre_tags")
}
```

**Key Features:**
- Each chapter can have multiple genres
- Unique constraint prevents duplicate genres for the same chapter
- Indexed by both chapter ID and genre for efficient querying
- Cascading delete ensures cleanup when chapters are deleted

## Backend Integration

### Catalog Service Updates

The `CatalogService` now includes genres in API responses:

```typescript
// listChapters() includes genres
genres: {
  select: {
    genre: true,
  },
}

// getChapter() includes genres
genres: {
  select: {
    genre: true,
  },
}
```

**API Response Example:**
```json
{
  "id": "chapter-uuid",
  "title": "Le Secret de la Forêt",
  "protagonistName": "Léa",
  "genres": [
    { "genre": "PASSIONS_CHARNELLES" },
    { "genre": "REVES_SECRETS" }
  ],
  "coverAsset": { ... }
}
```

## Frontend Integration

### Type Definitions

Added to `catalogStore.ts`:

```typescript
interface GenreTag {
  genre: string;
}

interface Chapter {
  // ... existing fields
  genres?: GenreTag[];
}
```

### Display Components

#### HomeNew.tsx - Popular Items Section

Genres are displayed as tags on popular book cards:

```tsx
{item.genres && item.genres.length > 0 && (
  <div className="flex gap-1 flex-wrap">
    {item.genres.slice(0, 2).map((genreTag: any, idx: number) => (
      <span className="inline-block bg-boudoir-800 text-gold text-[10px] uppercase px-2 py-0.5 rounded-full font-semibold">
        {genreTag.genre.replace(/_/g, ' ')}
      </span>
    ))}
  </div>
)}
```

**Display Details:**
- Shows up to 2 genres per card
- Genres displayed with `_` replaced by spaces for readability
- Uses boudoir-800 background with gold text for styling
- Placed below the description in popular items

## Database Seeding

The seed script assigns relevant genres to all 14 test chapters:

```typescript
{
  title: "Le Secret de la Forêt",
  protagonist: "Léa",
  genres: ["PASSIONS_CHARNELLES", "REVES_SECRETS"]
}
```

Each chapter is assigned 1-2 genres based on its narrative theme.

## Usage Examples

### Adding a Genre to a Chapter (Backend)

```typescript
await prisma.chapterGenreTag.create({
  data: {
    chapterId: 'chapter-uuid',
    genre: 'PASSIONS_CHARNELLES'
  }
});
```

### Querying Chapters by Genre (Backend)

```typescript
const chaptiers = await prisma.chapter.findMany({
  include: {
    genres: {
      where: {
        genre: 'PASSIONS_CHARNELLES'
      }
    }
  }
});
```

### Displaying Genres (Frontend)

```typescript
// In HomeNew.tsx or any component receiving chapter data
const genres = chapter.genres?.map(g => g.genre) || [];
```

## Migration Information

- **Migration Name:** `20260121064949_add_chapter_genres`
- **Database:** PostgreSQL
- **Applied:** January 21, 2026

### Migration Steps

1. Created `ChapterGenre` enum with 10 genre values
2. Added `ChapterGenreTag` model
3. Added `genres` relation to `Chapter` model
4. Updated catalog service to include genres in queries
5. Reseeded database with genre assignments

## Future Enhancements

Potential improvements to the genre system:

1. **Genre-based Filtering** - Filter chapters by selected genres in Catalogue
2. **Genre Descriptions** - Add detailed descriptions for each genre
3. **Genre Statistics** - Dashboard showing genre popularity
4. **Personalized Recommendations** - Suggest chapters based on user's preferred genres
5. **Genre Weights** - Allow primary vs. secondary genre classification
6. **Admin UI** - Interface for managing chapter genres
7. **Search Integration** - Search chapters by genre terms

## API Endpoints

### GET /api/reader/chapters

Returns all published chapters with their genres:

```bash
curl http://localhost:3000/api/reader/chapters
```

### GET /api/reader/chapters/:id

Returns a specific chapter with full genre details:

```bash
curl http://localhost:3000/api/reader/chapters/chapter-uuid
```

## Notes

- Genres are immutable enums - changes require database migration
- Genre values use UPPERCASE_WITH_UNDERSCORES format
- Frontend display converts underscores to spaces for readability
- The system supports unlimited genres per chapter
- Unique constraint prevents duplicate genre assignments
