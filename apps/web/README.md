# 📱 Cher Journal - Web Reader App

Application web lecteur pour le projet Cher Journal.

## ✅ Phase 1 - Fondations (COMPLÉTÉE)

L'infrastructure de base est maintenant en place avec :

- ✅ Client API avec gestion des tokens JWT
- ✅ State management d'authentification (Zustand)
- ✅ Pages de connexion et inscription
- ✅ Routing avec React Router
- ✅ Layout principal avec navigation
- ✅ Protection des routes (ProtectedRoute)
- ✅ Pages placeholders (Home, Library, Profile)

## ✅ Phase 2 - Catalogue & Découverte (COMPLÉTÉE)

Le catalogue des chapitres est maintenant fonctionnel :

- ✅ Page Home avec liste des chapitres
- ✅ Composant ChapterCard avec design responsive
- ✅ Page détails chapitre avec liste des volumes
- ✅ Composant VolumeList avec affichage des prix
- ✅ Store catalogue avec gestion d'état
- ✅ Boutons d'action (Acheter/Attendre/Lire) selon statut

## ✅ Phase 3 - Lecteur de Volumes (COMPLÉTÉE)

L'interface de lecture est maintenant disponible :

- ✅ Page Reader avec rendu du contenu HTML
- ✅ Sélecteur de perspective (Narrateur/Protagoniste)
- ✅ Paramètres de lecture (taille, police, interligne, thème)
- ✅ Sauvegarde automatique de la progression de lecture
- ✅ Mode sombre / clair
- ✅ Store lecteur avec persistance des préférences

## 🎉 Phase 4 - Bibliothèque & Gestion de Contenu (COMPLÉTÉE)

La page Bibliothèque personnelle est maintenant fonctionnelle :

- ✅ Page Library avec contenu acheté, gratuit et en attente
- ✅ Store libraryStore pour gestion de l'état
- ✅ Système de filtres (Tous, Achetés, Gratuits, En attente)
- ✅ Affichage des volumes avec statuts visuels
- ✅ Navigation vers le lecteur depuis la bibliothèque
- ✅ Design responsive avec cards attrayantes

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Backend Cher Journal en cours d'exécution sur `http://localhost:3000`

### Installation

```bash
# Depuis la racine du projet
npm install

# Ou directement dans apps/web
cd apps/web
npm install
```

### Configuration

Créez un fichier `.env` dans `apps/web/` :

```bash
VITE_API_URL=http://localhost:3000
```

### Lancement

```bash
# Depuis la racine
npm run dev:web

# Ou depuis apps/web
cd apps/web
npm run dev
```

L'application sera disponible sur : **http://localhost:5173**

## 📁 Structure du Projet

```
apps/web/
├── src/
│   ├── components/        # Composants réutilisables
│   │   └── common/        # Layout, ProtectedRoute
│   ├── pages/             # Pages principales
│   │   ├── Auth/          # Login, Register
│   │   ├── Home.tsx       # Catalogue (Phase 2)
│   │   ├── Library.tsx    # Bibliothèque (Phase 4)
│   │   └── Profile.tsx    # Profil utilisateur (Phase 5)
│   ├── lib/               # Utilitaires
│   │   └── api.ts         # Client API avec JWT
│   ├── stores/            # State management (Zustand)
│   │   ├── authStore.ts   # Store authentification
│   │   ├── catalogStore.ts # Store catalogue
│   │   ├── readerStore.ts  # Store lecteur
│   │   └── libraryStore.ts # Store bibliothèque (Phase 4)
│   ├── App.tsx            # Routing principal
│   └── main.tsx           # Point d'entrée
├── .env                   # Configuration environnement
└── package.json
```

## 🔐 Authentification

### Flux d'authentification

1. L'utilisateur accède à `/login` ou `/register`
2. Après connexion réussie, le token JWT est stocké dans `localStorage`
3. Les routes protégées vérifient l'authentification via `ProtectedRoute`
4. Le token est automatiquement envoyé dans les headers `Authorization: Bearer <token>`

### Routes disponibles

- **Publiques** :
  - `/login` - Connexion
  - `/register` - Inscription

- **Protégées** (nécessitent authentification) :
  - `/` - Catalogue des chapitres
  - `/chapters/:id` - Détails d'un chapitre
  - `/reader/:volumeId` - Lecteur de volume
  - `/library` - Bibliothèque personnelle (Phase 4)
  - `/profile` - Profil utilisateur

## 🛠 Technologies

- **React 18** - UI framework
- **React Router DOM 6** - Routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Vite** - Build tool

## 📝 Prochaines Étapes

### Phase 5 - Profil & Paramètres (PROCHAINE PRIORITÉ)

- [ ] Amélioration page Profile avec édition profil
- [ ] Historique de lecture
- [ ] Préférences de lecture personnalisées
- [ ] Statistiques utilisateur

### Phase 6 - Intégration Paiement (FUTURE)

- [ ] Intégration Stripe pour achats
- [ ] Système Wait-to-Read complet
- [ ] Codes promo et promotions
- [ ] Historique des achats

## 🧪 Tests

```bash
# Vérification TypeScript
npm run build

# Linting (si configuré)
npm run lint
```

## 🐛 Dépannage

### Le serveur ne démarre pas

Vérifiez que le port 5173 n'est pas déjà utilisé :

```bash
netstat -ano | findstr :5173
```

### Erreurs d'authentification

- Vérifiez que le backend est bien démarré sur `http://localhost:3000`
- Vérifiez que la variable `VITE_API_URL` est correctement définie dans `.env`
- Inspectez la console du navigateur pour les erreurs réseau

### Token expiré

Le token JWT est automatiquement effacé en cas d'erreur 401. L'utilisateur sera redirigé vers `/login`.

## 📚 Documentation API

Consultez le README du backend pour la documentation complète de l'API :

- `apps/backend/README.md`

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `tailwind.config.js` pour personnaliser le thème :

```js
theme: {
  extend: {
    colors: {
      primary: '#4F46E5', // indigo-600
    }
  }
}
```

## 📄 License

Ce projet fait partie du monorepo Cher Journal.

---

**Status** : Phase 1-4 ✅ complètes | Phase 5-6 en développement
**Dernière mise à jour** : 2026-01-21
