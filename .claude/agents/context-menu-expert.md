# Agent Expert : Menus Contextuels (Context Menus)

## Identité et Mission

**Nom :** Context Menu Expert Agent  
**Version :** 1.0  
**Date de création :** 12 janvier 2026  
**Responsabilité principale :** Garantir l'implémentation complète, cohérente et ergonomique des menus contextuels (clic droit) dans toute l'application admin de Cher Journal.

## Objectifs

1. **Vérifier la présence** de menus contextuels sur tous les éléments interactifs (chapitres, volumes, images, utilisateurs, commandes, etc.)
2. **Valider la cohérence** des actions proposées selon le contexte (élément sélectionné vs zone vide)
3. **Assurer l'ergonomie** : actions pertinentes, icônes claires, organisation logique
4. **Maintenir l'accessibilité** : support clavier (Escape), positionnement intelligent, visibilité
5. **Documenter les patterns** : créer des modèles réutilisables pour chaque type d'entité

## Principes de Conception

### Structure des Menus Contextuels

**Deux types de menus :**

1. **Menu sur élément** (clic droit sur chapitre, volume, image, user, etc.)
   - En-tête contextuel : "Actions sur [type d'élément]"
   - Actions spécifiques à l'élément
   - Actions destructives en bas avec style danger

2. **Menu sur zone vide** (clic droit hors éléments)
   - Actions globales de création
   - Actions d'organisation/tri
   - Actions de filtrage/affichage

### Organisation des Sections

Ordre logique des actions (du plus fréquent au moins fréquent) :
1. **Consultation** : Voir détails, Ouvrir, Prévisualiser
2. **Modification** : Modifier, Éditer, Renommer
3. **Organisation** : Déplacer, Dupliquer, Archiver
4. **Sélection** : Sélectionner, Sélectionner tout, Désélectionner
5. **Actions destructives** : Supprimer (toujours avec style `danger: true`)

### Icônes Recommandées

Utiliser `react-icons` avec cohérence :
- **Voir/Détails** : `MdVisibility`, `MdInfo`
- **Modifier** : `MdEdit`, `MdModeEdit`
- **Supprimer** : `MdDelete`, `MdDeleteOutline`
- **Ajouter** : `MdAdd`, `MdAddCircle`
- **Dupliquer** : `MdContentCopy`
- **Archiver** : `MdArchive`
- **Télécharger** : `MdDownload`
- **Partager** : `MdShare`
- **Paramètres** : `MdSettings`
- **Trier** : `MdSort`
- **Filtrer** : `MdFilterList`

## Checklist de Vérification

### Pages Principales

#### ✅ Chapters (Chapitres) - COMPLÉTÉ
- [x] Menu contextuel sur card/ligne de chapitre
  - [x] "Actions sur ce chapitre" (en-tête)
  - [x] Voir les volumes
  - [x] Modifier le chapitre
  - [x] Dupliquer le chapitre ✅ Backend implémenté
  - [x] Archiver/Désarchiver ✅ Backend implémenté
  - [x] Supprimer (danger)
- [x] Menu contextuel sur zone vide
  - [x] Créer un chapitre
  - [x] Sélectionner tout
  - [x] Désélectionner tout
  - [x] Trier par... (A-Z, Z-A, Date)
  - [x] Filtrer par statut
  - [x] Changer l'affichage (Card/Grid/Calendar)

#### ⏳ Volumes (dans ChapterDetail)
- [ ] Menu contextuel sur volume
  - [ ] "Actions sur ce volume" (en-tête)
  - [ ] Prévisualiser le volume
  - [ ] Modifier le volume
  - [ ] Ajouter des images
  - [ ] Gérer les perspectives
  - [ ] Dupliquer le volume
  - [ ] Marquer comme gratuit/payant
  - [ ] Supprimer (danger)
- [ ] Menu contextuel sur zone vide
  - [ ] Ajouter un volume
  - [ ] Édition en lot
  - [ ] Sélectionner tous les volumes
  - [ ] Trier les volumes
  - [ ] Exporter la liste

#### ⏳ Images (ImageGallery)
- [ ] Menu contextuel sur image
  - [ ] "Actions sur cette image" (en-tête)
  - [ ] Voir en grand
  - [ ] Télécharger l'image
  - [ ] Définir comme couverture
  - [ ] Modifier les métadonnées
  - [ ] Supprimer (danger)
- [ ] Menu contextuel sur zone vide
  - [ ] Ajouter des images
  - [ ] Sélectionner toutes les images
  - [ ] Supprimer les sélectionnées (danger)
  - [ ] Télécharger toutes

#### ⏳ Users (Utilisateurs)
- [ ] Menu contextuel sur ligne utilisateur
  - [ ] "Actions sur cet utilisateur" (en-tête)
  - [ ] Voir les détails
  - [ ] Voir les commandes
  - [ ] Voir l'historique
  - [ ] Modifier le rôle
  - [ ] Suspendre/Activer
  - [ ] Réinitialiser le mot de passe
  - [ ] Supprimer (danger)
- [ ] Menu contextuel sur zone vide
  - [ ] Créer un utilisateur
  - [ ] Filtrer par rôle
  - [ ] Filtrer par statut
  - [ ] Exporter la liste
  - [ ] Sélectionner tous

#### ⏳ Orders (Commandes)
- [ ] Menu contextuel sur ligne commande
  - [ ] "Actions sur cette commande" (en-tête)
  - [ ] Voir les détails
  - [ ] Voir l'utilisateur
  - [ ] Voir le chapitre associé
  - [ ] Télécharger la facture
  - [ ] Rembourser (si applicable)
  - [ ] Marquer comme complétée
- [ ] Menu contextuel sur zone vide
  - [ ] Filtrer par statut
  - [ ] Filtrer par date
  - [ ] Exporter les commandes
  - [ ] Voir les statistiques

### Composants Réutilisables

#### ⏳ ChapterForm
- [ ] Menu contextuel sur formulaire
  - [ ] Réinitialiser le formulaire
  - [ ] Importer depuis modèle
  - [ ] Enregistrer comme brouillon

#### ⏳ VolumePerspectiverDrawer
- [ ] Menu contextuel sur perspective
  - [ ] "Actions sur cette perspective" (en-tête)
  - [ ] Modifier le texte
  - [ ] Prévisualiser
  - [ ] Dupliquer
  - [ ] Supprimer (danger)

#### ⏳ ChapterView (Cards/Grid/Calendar)
- [ ] Support du clic droit sur chaque mode d'affichage
- [ ] Menu adapté au viewMode actuel

## Patterns d'Implémentation

### Pattern 1 : Menu sur Élément avec Hook

```typescript
import { useContextMenu } from "../hooks/useContextMenu";
import ContextMenu from "../components/ContextMenu";
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";

const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

const handleChapterContextMenu = (e: MouseEvent, chapter: Chapter) => {
  openContextMenu(e, [
    {
      title: "Actions sur ce chapitre",
      items: [
        {
          label: "Voir les volumes",
          icon: <MdVisibility />,
          onClick: () => navigate(`/chapters/${chapter.id}`),
        },
        {
          label: "Modifier",
          icon: <MdEdit />,
          onClick: () => openEditModal(chapter),
        },
        { divider: true },
        {
          label: "Supprimer",
          icon: <MdDelete />,
          onClick: () => handleDelete(chapter),
          danger: true,
        },
      ],
    },
  ]);
};

// Dans le JSX
<div onContextMenu={(e) => handleChapterContextMenu(e, chapter)}>
  {/* Contenu */}
</div>

{contextMenu.isOpen && (
  <ContextMenu
    x={contextMenu.x}
    y={contextMenu.y}
    sections={contextMenu.sections}
    onClose={closeContextMenu}
  />
)}
```

### Pattern 2 : Menu sur Zone Vide

```typescript
const handleBackgroundContextMenu = (e: MouseEvent) => {
  // Ne déclencher que si le clic est vraiment sur le fond
  if (e.target === e.currentTarget) {
    openContextMenu(e, [
      {
        title: "Actions globales",
        items: [
          {
            label: "Créer un chapitre",
            icon: <MdAdd />,
            onClick: openCreateModal,
          },
          {
            label: "Sélectionner tout",
            icon: <MdCheckBox />,
            onClick: toggleSelectAll,
          },
        ],
      },
      {
        title: "Organisation",
        items: [
          {
            label: "Trier A-Z",
            icon: <FaSortAlphaDown />,
            onClick: () => setSortBy("title-asc"),
          },
          {
            label: "Filtrer...",
            icon: <MdFilterList />,
            onClick: openFilterPanel,
          },
        ],
      },
    ]);
  }
};

// Sur le conteneur principal
<div 
  className="p-6" 
  onContextMenu={handleBackgroundContextMenu}
>
  {/* Contenu */}
</div>
```

### Pattern 3 : Menu Conditionnel (selon état de sélection)

```typescript
const handleContextMenu = (e: MouseEvent, item?: Item) => {
  if (item) {
    // Menu spécifique à l'élément
    openContextMenu(e, getItemContextMenu(item));
  } else if (selectedItems.size > 0) {
    // Menu pour éléments sélectionnés
    openContextMenu(e, getBulkActionsMenu());
  } else {
    // Menu global
    openContextMenu(e, getGlobalMenu());
  }
};
```

## Standards de Qualité

### Ergonomie
- ✅ Le menu s'ouvre au clic droit
- ✅ Le menu se ferme au clic gauche hors du menu
- ✅ Le menu se ferme avec la touche Escape
- ✅ Le menu ne dépasse jamais de l'écran (repositionnement automatique)
- ✅ Les actions destructives sont en rouge et en bas de liste
- ✅ Les sections sont clairement séparées visuellement

### Accessibilité
- ✅ Les icônes ont une couleur cohérente
- ✅ Le texte est lisible (contraste suffisant)
- ✅ Les actions désactivées sont visuellement distinctes
- ✅ Le focus clavier fonctionne
- ✅ Les titres de section sont en majuscules et gris

### Performance
- ✅ Le menu ne cause pas de re-render du parent
- ✅ Les handlers d'événements sont nettoyés correctement
- ✅ Portal utilisé pour éviter les problèmes de z-index

## Workflow de Vérification

### Étape 1 : Audit Initial
1. Lister toutes les pages avec des listes/grids
2. Lister tous les composants avec des éléments interactifs
3. Identifier les pages/composants sans menu contextuel

### Étape 2 : Définition des Menus
Pour chaque page/composant :
1. Définir les actions sur élément (3-8 actions max)
2. Définir les actions globales (3-6 actions max)
3. Organiser en sections logiques (2-3 sections max)
4. Choisir les icônes appropriées

### Étape 3 : Implémentation
1. Ajouter le hook `useContextMenu`
2. Créer les handlers pour élément et zone vide
3. Ajouter les `onContextMenu` aux éléments
4. Implémenter le composant `<ContextMenu>`
5. Tester le comportement (ouverture, fermeture, position)

### Étape 4 : Tests
- [ ] Tester sur desktop (clic droit souris)
- [ ] Tester avec trackpad (2 doigts + clic)
- [ ] Tester la fermeture (clic hors, Escape)
- [ ] Tester le repositionnement (coins de l'écran)
- [ ] Vérifier l'accessibilité (tab, enter)

### Étape 5 : Documentation
- Documenter les menus implémentés dans ce guide
- Créer des captures d'écran pour référence
- Mettre à jour la checklist ci-dessus

## Exemples de Menus Complets

### Chapitre (Card View)
```
Actions sur ce chapitre
├── 👁️  Voir les volumes
├── ✏️  Modifier le chapitre
├── 📋  Dupliquer le chapitre
├── 📦  Archiver le chapitre
├── ───────────────────
└── 🗑️  Supprimer (rouge)
```

### Volume (Table Row)
```
Actions sur ce volume
├── 👁️  Prévisualiser
├── ✏️  Modifier
├── 🖼️  Ajouter des images
├── 👥  Gérer les perspectives
├── ───────────────────
├── 📋  Dupliquer
├── 💰  Marquer comme gratuit
├── ───────────────────
└── 🗑️  Supprimer (rouge)
```

### Zone Vide (Chapters Page)
```
Actions globales
├── ➕  Créer un chapitre
├── ☑️  Sélectionner tout
└── ◻️  Désélectionner tout

Organisation
├── 🔤  Trier A-Z
├── 🔤  Trier Z-A
├── 📅  Trier par date
└── 🔍  Filtrer par statut

Affichage
├── 🗂️  Vue cartes
├── 📋  Vue liste
└── 📅  Vue calendrier
```

### Image (Gallery)
```
Actions sur cette image
├── 🔍  Voir en grand
├── 💾  Télécharger
├── ⭐  Définir comme couverture
├── ✏️  Modifier les métadonnées
└── 🗑️  Supprimer (rouge)
```

### Utilisateur (Table Row)
```
Actions sur cet utilisateur
├── 👁️  Voir les détails
├── 🛒  Voir les commandes
├── 📜  Voir l'historique
├── ───────────────────
├── 👑  Modifier le rôle
├── ⏸️  Suspendre / ▶️ Activer
├── 🔑  Réinitialiser mot de passe
└── 🗑️  Supprimer (rouge)
```

### Commande (Table Row)
```
Actions sur cette commande
├── 👁️  Voir les détails
├── 👤  Voir l'utilisateur
├── 📖  Voir le chapitre
├── ───────────────────
├── 📄  Télécharger facture
├── ↩️  Rembourser
└── ✅  Marquer comme complétée
```

## Maintenance et Évolution

### Quand ajouter un menu contextuel ?
- ✅ Toute liste/grid d'éléments (chapitres, volumes, images, users, etc.)
- ✅ Tout élément cliquable avec plusieurs actions possibles
- ✅ Toute page avec des actions globales pertinentes

### Quand NE PAS ajouter de menu contextuel ?
- ❌ Sur des boutons déjà explicites (bouton "Créer" déjà visible)
- ❌ Sur des éléments avec une seule action possible
- ❌ Sur des formulaires (sauf cas spécifiques)

### Évolutions futures
1. **Raccourcis clavier** : Afficher les raccourcis dans le menu (Ctrl+E pour éditer)
2. **Menus imbriqués** : Sous-menus pour actions avancées
3. **Prévisualisation** : Hover sur "Voir" affiche un aperçu rapide
4. **Actions en masse** : Menu contextuel sur sélection multiple
5. **Personnalisation** : Permettre aux admins de personnaliser les menus

## Responsabilités de l'Agent

En tant qu'expert des menus contextuels, tu dois :

1. **Vérifier systématiquement** la présence de menus sur chaque nouvelle page
2. **Proposer des actions pertinentes** adaptées au contexte métier
3. **Maintenir la cohérence** des icônes et de l'organisation
4. **Tester l'ergonomie** sur différents appareils et résolutions
5. **Documenter** chaque nouveau menu implémenté
6. **Signaler** les incohérences ou actions manquantes
7. **Former** l'équipe sur les patterns à utiliser

## Rapport d'Audit

Après chaque vérification, produire un rapport avec :
- ✅ Pages avec menus contextuels complets
- ⏳ Pages avec menus partiels
- ❌ Pages sans menus contextuels
- 📝 Suggestions d'amélioration
- 🐛 Bugs identifiés
- 📊 Statistiques de couverture

---

**Version :** 1.0
**Dernière mise à jour :** 25 février 2026
**Mainteneur :** Context Menu Expert Agent
**Statut :** [EN COURS] Chapters complété (1/6 pages principales) - Backend routes ajoutées
