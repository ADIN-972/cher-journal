# Livre de Coloriage - Documentation Frontend

## 📚 Vue d'ensemble

Le **Livre de Coloriage** est une perspective alternative dans la lecture de chapitres. Quand un utilisateur sélectionne la perspective "coloriage", au lieu d'afficher le tableau des matières avec les volumes à lire, le système affiche une galerie de pages à colorier inspirées du chapitre.

## 🎯 Concept et Fonctionnalité

### Perspectives disponibles:
- **Narrateur** (par défaut) - Affiche la collection de volumes narratifs
- **Protagoniste** - Affiche la perspective alternative du protagoniste
- **Coloriage** ← Nouveau - Affiche la galerie de pages à colorier

### Flux utilisateur:
```
1. Utilisateur ouvre un chapitre (ex: /chapters/abc123)
2. Sélectionne perspective "Coloriage" via PerspectiveSelector
3. URL change en /chapters/abc123/coloriage
4. La galerie de coloriages s'affiche à la place du tableau des matières
```

## 🏗️ Architecture Technique

### Fichiers principaux:

```
apps/web/src/
├── pages/
│   └── Chapter.tsx              ← Gère la sélection de perspective
│
├── components/
│   ├── PerspectiveSelector.tsx  ← Permet de choisir la perspective
│   ├── MobilePerspectiveSelector_V2.tsx
│   └── chapter/
│       ├── ChapterTableOfContents_V3.tsx  ← Affichage pour narrateur/protagoniste
│       └── ColoringGallery.tsx            ← Nouveau! Affichage pour coloriage
```

### Logique dans Chapter.tsx:

```typescript
// Récupération de la perspective depuis l'URL
const { perspective: urlPerspective } = useParams();

// Initialisation avec la perspective de l'URL
const [selectedPerspective, setSelectedPerspective] = useState(
  urlPerspective || "narrateur"
);

// Rendu conditionnel basé sur la perspective
{selectedPerspective === "coloriage" ? (
  <ColoringGallery chapterId={id!} />
) : (
  <ChapterTableOfContents_V3 {...props} />
)}
```

## 🎨 Design: Esthétique Boudoir

### Palette de couleurs:
- **Mode clair**: Red-200, Amber-200 (dégradés)
- **Mode sombre**: Red-900, Amber-900 (dégradés)
- **Accents**: Red-400/500 pour les icônes

### Composants visuels:
- **Gradient de fond**: Blend-multiply avec blur-3xl
- **Card principale**: Backdrop-blur-xl avec border-red-200/40
- **Bordure supérieure**: Gradient rouge → ambre
- **Feature cards**: Hover effects avec gradients subtils

### Typography:
- **Titre**: font-light, text-5xl, tracking-wide
- **Description**: font-light, text-lg, leading-relaxed
- **Feature titles**: font-semibold, text-xl, tracking-wide

## 🌙 Support Dark Mode

Tous les éléments ont des variantes `dark:`:

```tsx
// Exemple avec dark mode
<div className="bg-white dark:bg-slate-800
                border-red-200 dark:border-red-800">
  <p className="text-gray-900 dark:text-white">
    Texte adapté au mode
  </p>
</div>
```

### Switches automatiques:
- Mode clair activé: `hidden dark:hidden`
- Mode sombre activé: `hidden dark:block`

## 🎯 Material Symbols Outlined

Les icônes utilisent Google Material Symbols pour cohérence et professionnalisme:

### Icônes utilisées:
```
Icône principale:
- palette (icône palettes de couleurs)

Icônes des fonctionnalités:
- palette     → Designs Exclusifs
- cloud_download → Téléchargement Premium
- collections → Galerie Personnelle
```

### Chargement:
Le font Material Symbols est chargé automatiquement via Google Fonts lors du premier rendu du composant:

```typescript
// Charge depuis Google Fonts API
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:...'
document.head.appendChild(link);
```

## 🔧 Utilisation du Composant

### Import:
```typescript
import ColoringGallery from "../components/chapter/ColoringGallery";
```

### Props:
```typescript
interface ColoringGalleryProps {
  chapterId: string;  // ID du chapitre actuel
}

// Utilisation:
<ColoringGallery chapterId={id!} />
```

### État actuel:
Le composant affiche actuellement une interface "Bientôt disponible" avec:
- Titre, description et CTA badge
- 3 cartes de fonctionnalités futures
- Design luxueux et responsive

## 📋 État actuel (MVP - Coming Soon)

### Ce qui fonctionne:
✅ Sélection de perspective "coloriage" via interface
✅ Affichage de la galerie placeholder
✅ Design boudoir avec dark mode complet
✅ Material Symbols Outlined intégrés
✅ Responsive design (mobile/tablet/desktop)
✅ Animations et hover effects

### À implémenter (TODO):
```typescript
// Dans ColoringGallery.tsx, ligne 19:
// TODO: Fetch coloring pages from API once implemented
```

## 🚀 Intégration des données réelles

### Étape 1: Définir l'interface de données

```typescript
interface ColoringPage {
  id: string;
  title: string;
  pageNumber: number;
  category?: string;
  imageUrl: string;
  previewUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  size?: 'A4' | 'A3';
  printReady: boolean;
  createdAt: Date;
}

interface ColoringGalleryData {
  pages: ColoringPage[];
  totalCount: number;
  categories: string[];
}
```

### Étape 2: Créer l'API endpoint

Backend endpoint suggéré:
```
GET /api/chapters/{chapterId}/coloring-pages
GET /api/chapters/{chapterId}/coloring-pages?category=xxx
GET /api/chapters/{chapterId}/coloring-pages/{pageId}/download
```

### Étape 3: Implémenter le fetch dans ColoringGallery

```typescript
useEffect(() => {
  const fetchColoringPages = async () => {
    try {
      const response = await api.get(`/chapters/${chapterId}/coloring-pages`);
      setColoringPages(response.data.pages);
    } catch (error) {
      console.error('Failed to fetch coloring pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchColoringPages();
}, [chapterId]);
```

### Étape 4: Créer la grille de galerie

```typescript
// Remplacer la section Coming Soon par:
{isLoading ? (
  <div>Chargement...</div>
) : coloringPages.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {coloringPages.map(page => (
      <ColoringPageCard key={page.id} page={page} />
    ))}
  </div>
) : (
  // Afficher le Coming Soon si pas de données
)}
```

## 🎨 Structure de la galerie future

Recommandations pour l'affichage réel:

```
┌─────────────────────────────────┐
│  🎨 Filtrages (Catégorie, etc)  │
└─────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│ Page Card 1  │ Page Card 2  │ Page Card 3  │
├──────────────┼──────────────┼──────────────┤
│ Page Card 4  │ Page Card 5  │ Page Card 6  │
└──────────────┴──────────────┴──────────────┘

Chaque card contient:
- Image d'aperçu
- Titre et numéro de page
- Difficulté / Catégorie
- Bouton Télécharger / Aperçu
```

## 🔐 Contrôle d'accès

### Logique d'accès au coloriage:

```typescript
// Dans Chapter.tsx ou API
const canAccessColoring = (user, chapter) => {
  // Vérifier si l'utilisateur a acheté/accès au chapitre
  const hasChapterAccess = user.entitlements.some(
    e => e.chapterId === chapter.id && e.isAccessible
  );

  // Vérifier s'il y a un achat spécifique pour la galerie de coloriages
  const hasColoringAccess = user.purchases.some(
    p => p.type === 'COLORING' && p.chapterId === chapter.id
  );

  return hasChapterAccess || hasColoringAccess;
};
```

## 📱 Responsivité

La galerie s'adapte à tous les écrans:

```
Mobile (< 640px):
- 1 colonne
- Padding réduit
- Texte plus petit

Tablet (640px - 1024px):
- 2 colonnes
- Padding modéré

Desktop (> 1024px):
- 3 colonnes
- Padding complet
- Meilleurs espaces
```

## 🎯 Points clés à retenir

1. **Perspective** - "coloriage" est une 3e perspective, au même titre que "narrateur" et "protagonist"
2. **URL Sémantique** - `/chapters/{id}/coloriage` rend l'URL explicite
3. **Design** - Esthétique boudoir luxueuse avec support dark mode complet
4. **Icônes** - Material Symbols Outlined pour cohérence
5. **État MVP** - Actuellement un placeholder attractif, données réelles à venir
6. **Modularité** - Prêt pour intégration avec API backend

## 📚 Ressources supplémentaires

- [Material Symbols](https://fonts.google.com/icons)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [React Hooks Patterns](https://react.dev/reference/react)

---

**Dernière mise à jour**: 26 Février 2026
**Commits associés**: `1eaa4fb`, `15fbe02`, `db9da89`
