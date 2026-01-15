# Kanban Board - Cher Journal

## 🎯 To Do

### Backend
- [ ] Implémenter la logique de vérification des dates de publication dans le reader
- [ ] Créer les endpoints reader pour le web/mobile
- [ ] Implémenter le système de rendering des images (texte chiffré → PNG)
- [ ] Ajouter les webhooks Stripe pour les paiements
- [ ] Implémenter la logique wait-until-free complète
- [ ] Ajouter la gestion des assets (upload, stockage)

### Frontend Admin
- [ ] Ajouter l'éditeur de texte pour les VolumeVersions
- [ ] Interface de gestion des assets (images)
- [ ] Prévisualisation des volumes
- [ ] Gestion des promotions/codes promo
- [ ] Statistiques avancées (graphiques)

### Frontend Web
- [ ] Interface de lecture des chapitres
- [ ] Système d'authentification utilisateur
- [ ] Page de paiement Stripe
- [ ] Bibliothèque utilisateur
- [ ] Profil utilisateur

### Frontend Mobile
- [ ] Setup React Native / Expo
- [ ] Navigation principale
- [ ] Lecteur de volumes
- [ ] Synchronisation offline
- [ ] Notifications push

## 🚧 In Progress

### Backend
- [x] CRUD Volumes (routes, controller, service)
- [x] Système de prix (free-to-read, paywall, épilogue)
- [x] Dates de publication (Chapter, Volume)

### Frontend Admin
- [x] CRUD Chapitres complet
- [x] CRUD Volumes complet
- [x] Gestion des utilisateurs
- [x] Visualisation des commandes

## ✅ Done

### Infrastructure
- [x] Setup monorepo (npm workspaces)
- [x] Configuration Prisma + PostgreSQL
- [x] Seed data pour développement
- [x] Backend Fastify avec authentification
- [x] Admin UI avec React + Vite + TailwindCSS
- [x] Intégration react-hot-toast

### Backend
- [x] Modèle de données Prisma complet
- [x] Système d'encryption AES-256-GCM
- [x] Authentification cookie-based
- [x] CRUD Chapters (routes, controller, service, schemas)
- [x] CRUD Users (liste, activation, suspension)
- [x] CRUD Orders (visualisation)
- [x] Dashboard avec statistiques

### Frontend Admin
- [x] Layout avec sidebar
- [x] Page Dashboard
- [x] Page Chapters (liste + CRUD)
- [x] Page ChapterDetail avec liste des volumes
- [x] Page VolumeForm (create/edit)
- [x] Page Users
- [x] Page Orders
- [x] Composants réutilisables (Modal, ConfirmDialog, ChapterForm)

### Documentation
- [x] Instructions Copilot (.github/copilot-instructions.md)
- [x] Documentation de la logique de prix (PRICING_LOGIC.md)
- [x] Structure .claude pour agents AI

## 🔮 Backlog

### Features Avancées
- [ ] Système de commentaires utilisateurs
- [ ] Système de recommandations
- [ ] Mode hors-ligne pour mobile
- [ ] Traductions multilingues
- [ ] Thèmes (clair/sombre)
- [ ] Accessibilité (ARIA, screen readers)
- [ ] SEO optimization
- [ ] Analytics utilisateurs

### Performance
- [ ] Cache Redis pour les données fréquentes
- [ ] CDN pour les assets statiques
- [ ] Optimisation des images (WebP, responsive)
- [ ] Lazy loading des volumes

### DevOps
- [ ] CI/CD avec GitHub Actions
- [ ] Tests automatisés (unit, integration, e2e)
- [ ] Monitoring (Sentry, DataDog)
- [ ] Logs centralisés
- [ ] Backup automatique de la base de données

## 📊 Sprint Planning

### Sprint 1 (Semaine 1-2)
**Objectif**: Backend reader fonctionnel
- Endpoints reader avec vérification des accès
- Logique wait-until-free complète
- Rendering texte → image

### Sprint 2 (Semaine 3-4)
**Objectif**: Frontend web MVP
- Interface de lecture
- Authentification utilisateur
- Intégration Stripe

### Sprint 3 (Semaine 5-6)
**Objectif**: Mobile app MVP
- Navigation et lecteur
- Synchronisation
- Paiements in-app

### Sprint 4 (Semaine 7-8)
**Objectif**: Polish et tests
- Tests automatisés
- Corrections bugs
- Optimisations performance
