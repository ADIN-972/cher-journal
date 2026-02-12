# 📱 Plan d'implémentation - Application Web Lecteur (apps/web)

## 📋 État Actuel

L'application web lecteur (`apps/web`) est actuellement une coquille vide avec uniquement :
- ✅ Configuration Vite + React + TypeScript
- ✅ Tailwind CSS configuré
- ✅ React Router DOM installé
- ✅ Zustand (state management) installé
- ⚠️ Aucune page fonctionnelle implémentée

## 🎯 Backend Disponible

Le backend dispose déjà de modules complets pour les lecteurs :

### 1. **Catalog** (`/chapters`, `/chapters/:id`)
- Liste des chapitres publiés disponibles
- Détails d'un chapitre avec ses volumes

### 2. **Library** (`/library`)
- Bibliothèque personnelle de l'utilisateur
- Liste des chapitres/volumes achetés et accessibles

### 3. **Reader** (`/reader/volume-version`, `/reader/volume-versions/:versionId/render`)
- Lecture des volumes avec rendu du contenu
- Support des perspectives (Narrateur/Protagoniste)

### 4. **Pricing** (routes pricing)
- Calcul des prix par volume
- Gestion des promotions et entitlements

### 5. **Wait** (`/wait/start`, `/wait/status`, `/wait/active`)
- Système wait-to-read (attendre pour débloquer gratuitement)
- Statut des attentes actives

## 🚀 Architecture Proposée

### Structure de dossiers

```
apps/web/src/
├── components/          # Composants réutilisables
│   ├── common/         # Boutons, cards, modals, etc.
│   ├── catalog/        # Composants catalogue (ChapterCard, etc.)
│   ├── reader/         # Composants lecteur (VolumeReader, PerspectiveSwitch)
│   └── library/        # Composants bibliothèque
├── pages/              # Pages principales
│   ├── Home.tsx        # Page d'accueil avec catalogue
│   ├── Chapter.tsx     # Détails d'un chapitre
│   ├── Reader.tsx      # Lecteur de volume
│   ├── Library.tsx     # Bibliothèque personnelle
│   ├── Profile.tsx     # Profil utilisateur
│   └── Auth/           # Pages authentification
│       ├── Login.tsx
│       └── Register.tsx
├── lib/                # Utilitaires
│   ├── api.ts          # Client API (fetch wrapper)
│   ├── auth.ts         # Gestion authentification
│   └── utils.ts        # Fonctions utilitaires
├── stores/             # State management (Zustand)
│   ├── authStore.ts    # Store authentification
│   ├── catalogStore.ts # Store catalogue
│   └── libraryStore.ts # Store bibliothèque
├── types/              # Types TypeScript locaux
├── hooks/              # Custom React hooks
└── App.tsx             # Point d'entrée avec routing
```

## 📝 Plan d'Implémentation par Phase

### 🎯 PHASE 1 - Fondations (Priorité HAUTE 🔴)

**Objectif** : Infrastructure de base et authentification

**Sous-tâches** :
- [ ] Créer la structure de dossiers complète
- [ ] Configurer le client API avec gestion des tokens
- [ ] Implémenter le store d'authentification (Zustand)
- [ ] Créer les pages Login/Register
- [ ] Mettre en place le routing avec React Router
- [ ] Créer le Layout principal avec navigation
- [ ] Implémenter la gestion des tokens JWT
- [ ] Ajouter la protection des routes (requireAuth)

**Fichiers à créer** :
- `src/lib/api.ts` - Client API
- `src/stores/authStore.ts` - State management auth
- `src/pages/Auth/Login.tsx` - Page connexion
- `src/pages/Auth/Register.tsx` - Page inscription
- `src/components/common/Layout.tsx` - Layout principal
- `src/components/common/ProtectedRoute.tsx` - HOC protection

**Estimation** : 1-2 jours

---

### 🎯 PHASE 2 - Catalogue & Découverte (Priorité HAUTE 🔴)

**Objectif** : Permettre aux utilisateurs de découvrir les chapitres

**Sous-tâches** :
- [ ] Créer la page Home avec liste des chapitres
- [ ] Composant ChapterCard avec image, titre, description
- [ ] Intégrer l'API `/chapters` pour liste
- [ ] Page détails chapitre avec volumes
- [ ] Affichage des prix par volume
- [ ] Boutons "Acheter" / "Attendre" / "Lire" selon statut
- [ ] Store catalogue avec caching
- [ ] Filtres et recherche dans le catalogue

**Fichiers à créer** :
- `src/pages/Home.tsx` - Catalogue principal
- `src/pages/Chapter.tsx` - Détails chapitre
- `src/components/catalog/ChapterCard.tsx`
- `src/components/catalog/VolumeList.tsx`
- `src/stores/catalogStore.ts`

**Estimation** : 2-3 jours

---

### 🎯 PHASE 3 - Lecteur de Volumes (Priorité HAUTE 🔴)

**Objectif** : Interface de lecture des chapitres/volumes

**Sous-tâches** :
- [ ] Page Reader avec rendu du contenu
- [ ] Intégration API `/reader/volume-versions/:versionId/render`
- [ ] Sélecteur de perspective (Narrateur/Protagoniste)
- [ ] Navigation entre volumes (suivant/précédent)
- [ ] Gestion du scroll et de la position de lecture
- [ ] Sauvegarde de progression (localStorage)
- [ ] Mode sombre / clair
- [ ] Réglages typographie (taille, police)

**Fichiers à créer** :
- `src/pages/Reader.tsx` - Page lecteur
- `src/components/reader/VolumeReader.tsx`
- `src/components/reader/PerspectiveSwitch.tsx`
- `src/components/reader/ReadingSettings.tsx`
- `src/hooks/useReadingProgress.ts`

**Estimation** : 3-4 jours

---

### 🎯 PHASE 4 - Bibliothèque & Achats (Priorité MOYENNE 🟡)

**Objectif** : Gestion bibliothèque et processus d'achat

**Sous-tâches** :
- [ ] Page Library avec contenu acheté
- [ ] Intégration API `/library`
- [ ] Filtres bibliothèque (chapitres, volumes, non lus)
- [ ] Interface d'achat avec Stripe Checkout
- [ ] Page confirmation d'achat
- [ ] Gestion du système Wait-to-Read
- [ ] Compteur d'attente visuel
- [ ] Historique des achats

**Fichiers à créer** :
- `src/pages/Library.tsx`
- `src/pages/Checkout.tsx`
- `src/components/library/PurchasedContent.tsx`
- `src/components/library/WaitTimer.tsx`
- `src/stores/libraryStore.ts`
- `src/lib/stripe.ts`

**Estimation** : 3-4 jours

---

### 🎯 PHASE 5 - Profil & Paramètres (Priorité BASSE 🟢)

**Objectif** : Gestion du profil utilisateur

**Sous-tâches** :
- [ ] Page Profile avec informations utilisateur
- [ ] Modification email/mot de passe
- [ ] Préférences de lecture
- [ ] Historique de lecture
- [ ] Statistiques personnelles (volumes lus, temps de lecture)
- [ ] Gestion des notifications

**Fichiers à créer** :
- `src/pages/Profile.tsx`
- `src/pages/Settings.tsx`
- `src/components/profile/ReadingStats.tsx`

**Estimation** : 2-3 jours

---

### 🎯 PHASE 6 - Optimisations & UX (Priorité BASSE 🟢)

**Objectif** : Améliorer l'expérience utilisateur

**Sous-tâches** :
- [ ] Loading states et skeletons
- [ ] Gestion d'erreurs améliorée
- [ ] Toast notifications
- [ ] Animations et transitions
- [ ] SEO (meta tags, sitemap)
- [ ] PWA configuration (manifest, service worker)
- [ ] Responsive design mobile/tablet
- [ ] Accessibilité (a11y)

**Estimation** : 2-3 jours

---

## 🛠 Technologies & Librairies Suggérées

### Déjà installées
- ✅ React 18
- ✅ React Router DOM 6
- ✅ Zustand (state)
- ✅ Tailwind CSS
- ✅ TypeScript

### À ajouter (optionnel)
- [ ] `react-hot-toast` - Notifications
- [ ] `@tanstack/react-query` - Cache et gestion serveur state
- [ ] `framer-motion` - Animations
- [ ] `react-markdown` - Rendu markdown si nécessaire
- [ ] `@stripe/stripe-js` - Intégration Stripe
- [ ] `date-fns` - Manipulation dates
- [ ] `clsx` ou `classnames` - Gestion classes CSS
- [ ] `zod` - Validation formulaires

## 📊 Estimation Totale

**Développement complet** : 15-20 jours de travail

**Phases critiques (MVP)** :
- Phase 1 + 2 + 3 = **6-9 jours**
- Permet : Authentification, catalogue, et lecture de base

## 🎯 Prochaines Étapes Immédiates

1. **Valider l'architecture** avec l'équipe/utilisateur
2. **Commencer par Phase 1** (Fondations)
3. **Itérer rapidement** sur les phases suivantes
4. **Tests réguliers** avec utilisateurs réels

---

**Document créé** : 2026-01-21
**Status** : ⏳ Proposition en attente de validation
**Priorité** : À définir selon besoins métier
