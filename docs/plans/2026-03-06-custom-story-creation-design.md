# Créer votre histoire - Design Complet

**Date:** 2026-03-06
**Feature:** Custom Story Creation pour Cher Journal
**Status:** Approved

---

## 1. ARCHITECTURE GÉNÉRALE & FLUX

### Vue d'ensemble
La fonctionnalité "Créer votre histoire" comprend 3 composants majeurs:

#### 1.1 Home Page Teaser (apps/web)
- Section attrayante sur la page d'accueil
- Description du concept + bouton "Oui, je le veux"
- Design sensuel, cohérent avec l'esthétique Cher Journal

#### 1.2 Formulaire Multi-étapes (apps/web)
- 5 étapes wizards: Protagoniste → Personnalité → Niveaux Émotionnels → Structure Histoire → Finalisation
- Sauvegarde en brouillon entre les étapes
- Validation progressive

#### 1.3 Admin Dashboard (apps/admin)
- Tableau de modération avec filtres
- Validation automatique (malwares, sécurité)
- Review humaine et rejet/acceptation avec messages
- Historique d'actions

### Flux utilisateur complet
1. Utilisateur connecté clique sur teaser → va au formulaire
2. Remplit 5 étapes → Soumet
3. Validation automatique (malwares, fichiers)
4. En attente de review humaine (admin)
5. Admin accepte/rejette
6. Utilisateur notifié in-app + email
7. Accès à section "Mes Demandes" dans profil utilisateur

---

## 2. FORMULAIRE MULTI-ÉTAPES (Frontend)

### Structure des 5 étapes

#### Étape 1: Protagoniste
- Champ texte: Nom de la protagoniste (requis)
- Upload photos: Drag-drop ou sélection, max 10 photos (5MB chaque, JPG/PNG)
- Mini galerie affichant les photos uploadées
- Bouton supprimer par photo → archive liée à l'userId
- Barre de progression: "1/5"

#### Étape 2: Personnalité & Histoire
- Textarea: Description personnalité/histoire (requis)
- Sélection genres: Max 5 parmi les 15 genres disponibles:
  - Passionate Desires
  - Sweet Romance
  - Sensual Mystery
  - Forbidden
  - Seduction & Conquest
  - Secret Dreams
  - Raw Passion
  - Complicated Love
  - Nocturnal Desire
  - Liberation
  - Self-Discovery
  - Psychological Intimacy
  - Awakening of Desire
  - Transformative Relations
  - Body Memory
- Sélection explicite: 5 niveaux pour détail des scènes charnelles:
  1. **Romantique** - Scènes suggérées, fade to black, focus émotionnel et poétique
  2. **Suggestif** - Moments évocateurs, descriptions évasives, langage raffiné et allusif
  3. **Sensuel** - Descriptions détaillées des sensations et gestes, langage poétique et descriptif
  4. **Explicite** - Descriptions directes et détaillées, langage cru mais littéraire
  5. **Très explicite** - Descriptions très crues et détaillées, langage direct et non censuré
- Indicateurs visuels pour chaque niveau d'explicite

#### Étape 3: Niveaux Émotionnels
- 4 sliders (1-5): Intensité, Douceur, Danger, Transformation
- Descriptions détaillées sous chaque slider:
  - **Intensité** - force du désir, tension charnelle
  - **Douceur** - tendresse, vulnérabilité, délicatesse
  - **Danger** - risque émotionnel, social, moral ou physique
  - **Transformation** - évolution des personnages, changements majeurs, impact profond sur les personnages et l'intrigue
- Affichage visuel des valeurs sélectionnées

#### Étape 4: Structure Histoire (10 Volumes)
- 10 sections identiques, chacune avec:
  - Champ: Lieu/Région proposée
  - Champ: Orientation/événement clé
  - Champ: Twist ou surprise envisagée
- **Fin de l'histoire**: Options prédéfinies + textarea optionnel:
  - Happy ending (finale heureuse)
  - Bittersweet (doux-amer)
  - Tragic (tragique)
  - Open ending (fin ouverte)
  - + Textarea optionnel pour détailler/customiser

#### Étape 5: Finalisation
- Champ email (requis)
- Checkbox: "Je comprends que les textes créés seront propriété de l'auteur"
- Checkbox: Consentement RGPD/CCPA (affiche lien politique confidentialité)
- Résumé des données avant soumission
- Bouton "Soumettre ma demande"

### Expérience UX
- Sauvegarde auto en brouillon après chaque étape
- Possibilité revenir aux étapes précédentes
- Validation progressive (erreurs détectées à la soumission d'étape)
- Design responsive mobile/tablet/desktop

---

## 3. BACKEND - MODÈLE DE DONNÉES & SÉCURITÉ

### Schéma Prisma (Nouvelle table: `CustomStoryRequest`)

```prisma
model CustomStoryRequest {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id])

  // Protagoniste
  protagonistName String
  photoAssetIds String[] // Array d'IDs d'assets uploadées

  // Personnalité
  description String
  selectedGenres String[] // Max 5
  explicitLevel String // "ROMANTIQUE" | "SUGGESTIF" | "SENSUEL" | "EXPLICITE" | "TRES_EXPLICITE"

  // Niveaux Émotionnels
  niveauIntensité Int @db.SmallInt // 1-5
  niveauDouceur Int @db.SmallInt // 1-5
  niveauDanger Int @db.SmallInt // 1-5
  niveauTransformation Int @db.SmallInt // 1-5

  // Structure Histoire
  volumeProposals VolumeProposal[]
  storyEnding String // "HAPPY" | "BITTERSWEET" | "TRAGIC" | "OPEN"
  storyEndingCustom String? @db.Text

  // Contact & Consentements
  email String
  rgpdConsent Boolean @default(false)
  ccpaConsent Boolean @default(false)

  // Modération & Traçabilité
  status String @default("PENDING") // "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED"
  rejectionReason String?
  rejectionNotes String?

  // Sécurité & Analytics
  userIp String // Hashée
  userMacAddress String?
  userLocation String?
  userAgent String

  // Timestamps
  submittedAt DateTime @default(now())
  reviewedAt DateTime?
  reviewedBy String? // FK → Admin User
  dataRetentionDeletedAt DateTime? // submittedAt + 3 mois

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([submittedAt])
  @@index([dataRetentionDeletedAt])
}

model VolumeProposal {
  id String @id @default(cuid())
  customStoryRequestId String
  customStoryRequest CustomStoryRequest @relation(fields: [customStoryRequestId], references: [id], onDelete: Cascade)

  volumeNumber Int @db.SmallInt // 1-10
  proposedLocation String
  proposedOrientation String
  proposedTwist String

  @@unique([customStoryRequestId, volumeNumber])
}
```

### Sécurité des uploads
- **Validation côté serveur**: Vérifier MIME type (JPG/PNG), taille (5MB max), extension
- **Scan malwares**: Intégrer ClamAV ou VirusTotal API
- **Stockage**: Dossier `/uploads/custom-stories/{userId}/` avec UUID pour chaque photo
- **Suppression**: Si utilisateur supprime photo → déplace dans `/uploads/archives/{userId}/` avec timestamp

### Collecte de données sécurisée (RGPD/CCPA compliant)
- **IP**: Collectée, hashée avec salt unique + contexte utilisateur
- **MAC**: Collectée si accessible (sinon null)
- **Localisation**: Via IP geolocation (service comme MaxMind ou similar)
- **User-Agent**: Stocké pour analyser les patterns de bots
- **Suppression auto**: Trigger Cron qui supprime les enregistrements où `dataRetentionDeletedAt < now()` après 3 mois
- **Politique de confidentialité**: À rédiger avec mention RGPD/CCPA explicite

### Endpoints API
- `POST /api/custom-stories` - Créer demande
- `PUT /api/custom-stories/{id}` - Mettre à jour brouillon
- `GET /api/custom-stories/{id}` - Récupérer brouillon/demande
- `DELETE /api/custom-stories/{id}/photos/{photoId}` - Supprimer photo
- `POST /api/custom-stories/{id}/submit` - Soumettre définitivement
- `GET /api/custom-stories` - Lister demandes utilisateur
- `POST /api/admin/custom-stories/{id}/approve` - Admin: Approuver
- `POST /api/admin/custom-stories/{id}/reject` - Admin: Rejeter
- `GET /api/admin/custom-stories` - Admin: Lister pour modération

---

## 4. ADMIN DASHBOARD - SYSTÈME DE MODÉRATION

### Page: Gestion des Demandes Personnalisées (apps/admin)

#### Tableau de modération
Colonnes affichées:
- Protagoniste (nom + mini photo)
- Auteur (username + email)
- Date submission
- Status (badge: PENDING/UNDER_REVIEW/APPROVED/REJECTED/CANCELLED)
- Actions (Voir détails, Approuver, Rejeter)

#### Filtres disponibles
- Par statut (PENDING, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED)
- Par date (derniers jours/semaines)
- Par raison de rejet (si applicable)
- Recherche par nom protagoniste ou utilisateur

#### Workflow de modération

**Phase 1: Validation automatique (serveur)**
- Scan malwares sur photos (ClamAV/VirusTotal)
- Vérification poids/format
- Détection patterns suspects (IP blocklist, MAC patterns)
- Si validation réussit → `status = PENDING`
- Si échoue → `status = REJECTED` avec raison automatique

**Phase 2: Review humaine (admin)**
Admin ouvre la demande → affichage complet:
- Photos de la protagoniste (galerie scrollable)
- Description personnalité
- Genres & explicite sélectionnés
- Niveaux émotionnels (affichage visuel des sliders)
- Structure 10 volumes proposée
- Métadonnées sécurité (IP hashée, localisation, User-Agent)

Admin peut:
- ✅ **Approuver** → `status = APPROVED`
  - Histoire sera créée automatiquement (backend job async)
  - Utilisateur notifié in-app + email
  - Histoire visible dans section premium personnalisée

- ❌ **Rejeter** → `status = REJECTED`
  - Admin saisi raison (dropdown: "Contenu inapproprié", "Photos de faible qualité", "Données suspectes", etc. + texte optionnel)
  - Utilisateur notifié in-app + email avec raison
  - Photos supprimées mais tracées dans archives

- ⏸️ **Marquer "Sous Review"** → `status = UNDER_REVIEW`
  - Pour demandes qui nécessitent plus de temps/enquête
  - Utilisateur notifié qu'il est en cours d'examen

### Notifications pour admins
- Dashboard affiche nombre demandes PENDING en badge rouge
- Email notif quotidienne: résumé des nouvelles demandes
- Alerte immédiate si validation auto rejette (possible abus)

---

## 5. NOTIFICATIONS & SUIVI UTILISATEUR

### Système de notifications in-app

**Centre de notifications**
- Icône cloche dans le header (apps/web)
- Badge rouge avec nombre notifications non lues
- Dropdown affichant les 5 dernières notifications
- Lien "Voir toutes les notifications"

**Types de notifications**
1. **Demande créée** - "Votre demande 'Emma' a été reçue"
2. **Sous review** - "Votre demande 'Emma' est en cours d'examen"
3. **Approuvée** - "🎉 Votre histoire 'Emma' a été approuvée! Accédez-la dans la section dédiée"
4. **Rejetée** - "❌ Votre demande 'Emma' a été rejetée. Raison: [texte admin]"
5. **Disponible à l'achat** - "L'histoire 'Emma' est maintenant disponible en bundle ou en impression"

### Section "Mes Demandes" dans le profil utilisateur

**Nouvelle page: `/profile/custom-stories`**

Affichage (cartes):
- **Photo protagoniste** (mini thumbnail)
- **Nom protagoniste**
- **Status badge** (couleur codée: gris=pending, bleu=review, vert=approved, rouge=rejected, gris=cancelled)
- **Date de submission**
- **Boutons d'action**:
  - Demandes PENDING/UNDER_REVIEW → **"Voir détails"** (lecture seule)
  - Demandes APPROVED → **"Accéder à l'histoire"** + **"Voir bundle"** + **"Commander impression"**
  - Demandes REJECTED → **"Voir raison"** + **"Créer nouvelle demande"**
  - Demandes CANCELLED → Info: "Cette demande a été annulée"

**Détails de la demande** (modal/page)
- Affichage complet des données saisies
- Timeline des statuts (créée → sous review → approuvée)
- Message admin (si rejet/commentaires)

### Notifications par email
- Triggered à chaque changement de status
- Template HTML sensuel/cohérent avec design Cher Journal
- Inclut lien direct vers la demande
- Lien pour gérer les préférences de notifications

### Annulation de demande
- Utilisateur peut annuler avant approbation/rejet
- Bouton "Annuler cette demande" sur demandes PENDING/UNDER_REVIEW
- Photos archivées automatiquement
- Perd la "traçabilité/paternité" mais histoire potentiellement utilisable par admin pour rédaction

---

## 6. MODÈLE COMMERCIAL & TARIFICATION

### Story Approuvée
1. **Histoire créée gratuitement** par l'équipe auteur
2. **Utilisateur accès premium**:
   - **Réduction bundle**: Accès au chapitre + protagoniste à prix réduit
   - **Option impression + livraison**: Commander version imprimée/reliée de son histoire

### Section dédiée
- Nouvelle section "Histoires Personnalisées" dans la catalogue
- Affichage: Liste des histoires approuvées avec foto protagoniste
- Filtrage: Par utilisateur (profil), par genre, par niveaux émotionnels
- Achats via système existant de bundle/promotions

---

## 7. POLITIQUE DE CONFIDENTIALITÉ & CONFORMITÉ

### Points clés à documenter
- Collecte de données: IP, MAC, localisation, User-Agent
- Durée de rétention: 3 mois max
- Suppression automatique après rétention
- Utilisation données: Modération, détection abus, analytics
- Droit d'accès et suppression (RGPD Art. 17)
- Consentement explicite avant soumission
- Photos: Stockage sécurisé, suppression sur rejet

### Contenu "Propriété de l'auteur"
Paragraphe explicatif visible étape 5:
> "Les textes créés à partir de votre demande deviendront propriété de Cher Journal. L'auteur se réserve le droit de suivre ou non les suggestions que vous proposez. Cer Journal pourra adapter, modifier ou compléter votre histoire selon sa vision artistique."

---

## 8. FICHIERS À CRÉER/MODIFIER

### Frontend (apps/web)
- `src/pages/CreateStoryPage.tsx` - Page principale wizard
- `src/components/CreateStory/StoryStep1Protagonist.tsx` - Étape 1
- `src/components/CreateStory/StoryStep2Personality.tsx` - Étape 2
- `src/components/CreateStory/StoryStep3Emotions.tsx` - Étape 3
- `src/components/CreateStory/StoryStep4Structure.tsx` - Étape 4
- `src/components/CreateStory/StoryStep5Finalize.tsx` - Étape 5
- `src/components/CreateStory/PhotoUploadGallery.tsx` - Composant upload photos
- `src/pages/Profile/MyCustomStoriesPage.tsx` - Page "Mes Demandes"
- Modifier `src/pages/HomePage.tsx` - Ajouter teaser section
- Modifier `src/pages/Profile/index.tsx` - Ajouter lien vers "Mes Demandes"

### Backend (apps/backend)
- `src/modules/custom-stories/custom-stories.service.ts` - Logique métier
- `src/modules/custom-stories/custom-stories.controller.ts` - Endpoints
- `src/modules/custom-stories/dto/create-story.dto.ts` - Validation DTO
- `src/modules/security/malware-scanner.service.ts` - Scan fichiers
- `src/modules/security/ip-logger.service.ts` - Collecte données sécurité
- Migration Prisma pour créer tables `CustomStoryRequest` et `VolumeProposal`

### Admin (apps/admin)
- `src/pages/CustomStories.tsx` - Page modération
- `src/components/CustomStoryReviewModal.tsx` - Modal review
- `src/components/CustomStoryMetadata.tsx` - Affichage données sécurité

### Documentation
- `docs/PRIVACY_POLICY.md` - Politique de confidentialité RGPD/CCPA compliant
- `docs/CUSTOM_STORIES_GUIDE.md` - Guide pour utilisateurs

---

## 9. PRIORITÉ IMPLÉMENTATION (Suggestions)

1. **Phase 1 (MVP)**: Formulaire + Backend simple (sans scan malwares initialement)
2. **Phase 2**: Admin dashboard + modération
3. **Phase 3**: Notifications + profil utilisateur
4. **Phase 4**: Scan malwares + sécurité renforcée
5. **Phase 5**: Tarification + section premium

---

**Design approuvé et prêt pour implémentation.**
