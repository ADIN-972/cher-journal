# Skill: Changelog

## Description
Génération et maintenance du CHANGELOG pour tracer l'historique des changements du projet.

## Usage
```
@changelog [action] [version]
```

## Actions
- `add` - Ajouter une entrée au changelog
- `generate` - Générer changelog depuis commits Git
- `view` - Afficher changelog actuel

## Format

### Keep a Changelog
```markdown
# Changelog

All notable changes to Cher Journal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nouveau module de statistiques avancées
- Export CSV des commandes

### Changed
- Amélioration performance du reader (chargement texte)

### Fixed
- Correction bug wait-until-free sur volumes extra

## [1.2.0] - 2024-01-10

### Added
- Module de statistiques avec KPIs dashboard
- API endpoint `/admin/stats`
- Support export CSV

### Changed
- Refactoring service wait-until-free
- Amélioration validation Zod pour uploads

### Fixed
- Fix race condition dans timer wait
- Correction validation email case-insensitive

### Security
- Renforcement validation uploads (mime types)
- Rate limiting sur endpoints publics

## [1.1.0] - 2024-01-05

### Added
- Support perspectives NARRATOR/PROTAGONIST
- Render texte en image avec Canvas
- Système wait-until-free complet

### Changed
- Migration encryption vers envelope encryption
- Amélioration structure modules backend

## [1.0.0] - 2024-01-01

### Added
- Architecture monorepo initiale
- Backend Fastify + Prisma + PostgreSQL
- Frontend Admin React
- Authentification session-based
- Paiements Stripe avec webhooks
- Encryption AES-256-GCM pour textes
- Système d'entitlements et unlocks
```

## Catégories

### Added
Nouvelles fonctionnalités ajoutées.
```markdown
### Added
- Nouveau module X
- Support de Y
- API endpoint Z
```

### Changed
Modifications de fonctionnalités existantes.
```markdown
### Changed
- Refactoring du module X
- Amélioration performance de Y
- Mise à jour dépendance Z
```

### Deprecated
Fonctionnalités marquées comme obsolètes (à supprimer prochainement).
```markdown
### Deprecated
- API v1 (sera supprimée en v3.0)
- Endpoint `/old-endpoint` (utiliser `/new-endpoint`)
```

### Removed
Fonctionnalités supprimées.
```markdown
### Removed
- Support Node.js 16
- Endpoint `/deprecated-endpoint`
```

### Fixed
Corrections de bugs.
```markdown
### Fixed
- Correction bug dans le wait timer
- Fix race condition lors de l'achat
- Résolution erreur 500 sur `/api/library`
```

### Security
Changements liés à la sécurité.
```markdown
### Security
- Patch vulnérabilité CVE-2024-XXX
- Renforcement validation des entrées
- Mise à jour dépendance avec faille de sécurité
```

## Versioning (Semantic Versioning)

### Format: MAJOR.MINOR.PATCH

**MAJOR** (1.0.0 → 2.0.0)
- Breaking changes
- Incompatibilité avec versions précédentes
- Migration requise

**MINOR** (1.0.0 → 1.1.0)
- Nouvelles fonctionnalités
- Backward compatible
- Pas de breaking changes

**PATCH** (1.0.0 → 1.0.1)
- Bug fixes
- Corrections mineures
- Backward compatible

## Génération Automatique

### Depuis Git Commits
```bash
# Conventional Commits
git log --oneline --pretty=format:"%s"

# Générer changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

### Conventional Commits Format
```
type(scope): description

feat(auth): add OAuth2 support
fix(reader): resolve text rendering issue
docs(api): update authentication documentation
refactor(wait): improve timer logic
test(volumes): add integration tests
chore(deps): update dependencies
```

Types:
- `feat`: Nouvelle fonctionnalité (→ Added)
- `fix`: Bug fix (→ Fixed)
- `docs`: Documentation
- `style`: Formatting, pas de code change
- `refactor`: Code change sans ajout/fix
- `test`: Ajout/modification tests
- `chore`: Maintenance, dependencies

## Scripts

```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "changelog:init": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0"
  }
}
```

## Template Nouvelle Version

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- 

### Changed
- 

### Deprecated
- 

### Removed
- 

### Fixed
- 

### Security
- 
```

## Exemple Complet

```markdown
## [2.0.0] - 2024-02-01

### Added
- **BREAKING**: Nouveau système de permissions granulaires
- Support multi-langue (EN, FR, ES)
- API GraphQL en parallèle de REST
- Dark mode pour admin interface
- Export PDF des chapitres

### Changed
- **BREAKING**: Structure des entitlements modifiée
  - Migration: `npm run migrate:entitlements-v2`
- Amélioration performances library (pagination côté serveur)
- Refactoring complet module wait-until-free
- Update React 18.2 → 18.3

### Deprecated
- API REST v1 endpoints (seront supprimés en v3.0)
  - `/api/v1/chapters` → `/api/v2/chapters`
- Cookie-based auth (migration vers JWT en v3.0)

### Removed
- Support Node.js 18 (minimum: Node.js 20)
- Ancien système de cache Redis (remplacé par in-memory)

### Fixed
- Race condition lors de paiements simultanés (#234)
- Fuites mémoire dans le renderer Canvas (#245)
- Validation incorrecte des emails avec + (#256)
- Timeout sur chapitres avec 100+ volumes (#267)

### Security
- Patch XSS dans l'éditeur de texte
- Update Stripe SDK (CVE-2024-12345)
- Renforcement CSP headers
- Ajout rate limiting sur tous les endpoints

### Migration Guide
1. Update Node.js vers 20+
2. Run `npm install`
3. Run `npm run migrate:entitlements-v2`
4. Update API calls de v1 vers v2
5. Test thoroughly
```

## Best Practices

### ✅ Do
- Mettre à jour CHANGELOG.md à chaque PR/release
- Utiliser Conventional Commits
- Documenter breaking changes clairement
- Inclure migration guide si nécessaire
- Dater les releases
- Garder section [Unreleased] à jour

### ❌ Don't
- Oublier de dater les releases
- Omettre breaking changes
- Descriptions vagues ("fix bug", "improve stuff")
- Duplications entre catégories
- Changements internes non visibles par utilisateurs

## Checklist Release

- [ ] CHANGELOG.md mis à jour
- [ ] Version bumped dans package.json
- [ ] Git tag créé (v1.2.0)
- [ ] Breaking changes documentés
- [ ] Migration guide fourni si nécessaire
- [ ] Tests passent
- [ ] Documentation mise à jour
- [ ] Release notes publiées
