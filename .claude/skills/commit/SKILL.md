# Skill: Commit

## Description
Gestion des commits Git avec conventions et bonnes pratiques pour Cher Journal.

## Usage
```
@commit [type] [scope] [message]
```

## Conventional Commits

### Format
```
type(scope): subject

[body]

[footer]
```

### Types

**feat** - Nouvelle fonctionnalité
```bash
git commit -m "feat(wait): add wait-until-free timer system"
git commit -m "feat(reader): implement text rendering to image"
```

**fix** - Correction de bug
```bash
git commit -m "fix(auth): resolve session expiration issue"
git commit -m "fix(stripe): handle webhook idempotence"
```

**docs** - Documentation
```bash
git commit -m "docs(api): update authentication endpoints"
git commit -m "docs(readme): add troubleshooting section"
```

**style** - Formatage (pas de changement de code)
```bash
git commit -m "style(backend): format with prettier"
git commit -m "style(components): fix indentation"
```

**refactor** - Refactoring sans ajout/fix
```bash
git commit -m "refactor(volumes): extract service logic"
git commit -m "refactor(crypto): simplify encryption function"
```

**test** - Tests
```bash
git commit -m "test(auth): add integration tests for login"
git commit -m "test(wait): add unit tests for timer service"
```

**chore** - Maintenance, dependencies
```bash
git commit -m "chore(deps): update fastify to 4.26"
git commit -m "chore: update gitignore"
```

**perf** - Performance
```bash
git commit -m "perf(library): optimize query with eager loading"
git commit -m "perf(reader): cache rendered images"
```

**build** - Build system
```bash
git commit -m "build: configure vite for production"
git commit -m "build(docker): optimize image layers"
```

**ci** - CI/CD
```bash
git commit -m "ci: add github actions workflow"
git commit -m "ci: configure automated tests"
```

**revert** - Revert
```bash
git commit -m "revert: revert feat(reader): implement caching"
```

### Scopes (Cher Journal)

**Backend**
- `auth` - Authentication/Authorization
- `admin` - Admin modules
- `reader` - Reader modules (library, catalog, wait, reader)
- `stripe` - Paiements Stripe
- `crypto` - Encryption/Decryption
- `prisma` - Database schema/migrations
- `middleware` - Middleware Fastify

**Frontend**
- `admin-ui` - Admin interface
- `web-ui` - Web reader interface
- `mobile` - Mobile app
- `components` - Composants React
- `store` - State management (Zustand)
- `hooks` - Custom hooks

**Global**
- `config` - Configuration
- `types` - TypeScript types
- `utils` - Utilities
- `docs` - Documentation

### Subject (Message)
- Impératif présent: "add" pas "added" ou "adds"
- Minuscule (pas de majuscule au début)
- Pas de point final
- Maximum 50 caractères
- Descriptif et précis

### Body (Optionnel)
Explication détaillée du changement.
```bash
git commit -m "feat(wait): add wait-until-free timer system

Implements the wait-until-free monetization system:
- Timer starts on first volume access
- Stores unlock in database with unlocksAt timestamp
- Prevents multiple active waits per chapter
- Creates/updates VolumeRead record

Closes #42"
```

### Footer (Optionnel)
References, breaking changes.
```bash
# Breaking change
BREAKING CHANGE: VolumeVersion.text field renamed to textBlobId

# Issue reference
Closes #123
Fixes #45, #67
See also #89

# Reviewed by
Reviewed-by: John Doe <john@example.com>
```

## Workflow Git

### Branches
```bash
# Main branches
main        # Production
develop     # Development

# Feature branches
feature/wait-until-free
feature/perspectives-narrator-protagonist

# Fix branches
fix/session-expiration
fix/webhook-idempotence

# Hotfix branches
hotfix/critical-security-patch
```

### Commit Workflow
```bash
# 1. Créer feature branch
git checkout -b feature/new-feature

# 2. Faire des changements
# Edit files...

# 3. Stage changes
git add src/modules/feature/

# 4. Commit avec convention
git commit -m "feat(feature): add new feature implementation"

# 5. Push
git push origin feature/new-feature

# 6. Create Pull Request
```

### Commit Message Template
```bash
# .gitmessage
# type(scope): subject (max 50 chars)
#
# Body (wrap at 72 chars)
# - Explain WHAT and WHY, not HOW
# - Use imperative present tense
#
# Footer
# - Breaking changes: BREAKING CHANGE: description
# - Issues: Closes #123, Fixes #456

# Types: feat, fix, docs, style, refactor, test, chore, perf, build, ci, revert
# Scopes: auth, admin, reader, stripe, crypto, prisma, components, store, etc.
```

Configure:
```bash
git config commit.template .gitmessage
```

## Exemples Complets

### Feature Simple
```bash
git commit -m "feat(reader): add text rendering to PNG"
```

### Bug Fix avec Contexte
```bash
git commit -m "fix(wait): prevent duplicate wait timers

Previously, users could start multiple wait timers for the same chapter,
causing confusion and incorrect unlock states.

Now checks for existing active wait before creating new one.
Throws WAIT_ALREADY_ACTIVE error if wait exists.

Fixes #234"
```

### Breaking Change
```bash
git commit -m "refactor(entitlements): restructure access model

BREAKING CHANGE: Entitlement structure changed from flat volumes
to range-based (volumeFrom, volumeTo).

Migration: Run `npm run migrate:entitlements-v2`

This change simplifies access checking and supports future features
like season passes and partial access.

Closes #156"
```

### Multiple Changes
```bash
# ✅ DO: Separate commits
git commit -m "feat(auth): add OAuth2 support"
git commit -m "docs(auth): document OAuth2 configuration"
git commit -m "test(auth): add OAuth2 integration tests"

# ❌ DON'T: Single commit for multiple unrelated changes
git commit -m "add oauth, fix typos, update deps"
```

## Pre-commit Hooks

### Husky + Commitlint
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky

# Configure commitlint
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# Setup husky
npx husky-init
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### Lint-staged
```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.tsx": ["eslint --fix", "prettier --write"]
  }
}
```

## Commit Best Practices

### ✅ Do
- Commits atomiques (une préoccupation par commit)
- Messages descriptifs et précis
- Utiliser Conventional Commits
- Référencer issues/PRs
- Tester avant de commit
- Commit régulièrement (petits commits)
- Écrire au présent impératif

### ❌ Don't
- Commits géants avec tous les changements
- Messages vagues ("fix bug", "update code")
- Commits de code non testé
- Commits avec code commenté
- Commits avec console.log de debug
- Mélanger changements non liés
- Committer node_modules, .env, etc.

## Amend & Rebase

### Amend Last Commit
```bash
# Modifier dernier commit (message ou fichiers)
git add forgotten-file.ts
git commit --amend --no-edit

# Changer message
git commit --amend -m "feat(feature): corrected message"
```

### Interactive Rebase
```bash
# Rebase derniers 3 commits
git rebase -i HEAD~3

# Options:
# pick   - garder commit
# reword - changer message
# edit   - modifier commit
# squash - fusionner avec précédent
# fixup  - fusionner sans message
# drop   - supprimer commit
```

### Squash Commits (avant merge)
```bash
git rebase -i HEAD~5
# Squash 5 derniers commits en 1
```

## Signing Commits (GPG)

```bash
# Generate GPG key
gpg --gen-key

# List keys
gpg --list-secret-keys --keyid-format LONG

# Configure git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# Commit signé
git commit -S -m "feat(auth): add GPG signing"
```

## Checklist Avant Commit

- [ ] Code fonctionne (testé localement)
- [ ] Tests passent
- [ ] Pas de console.log/debugger
- [ ] Code formaté (prettier/eslint)
- [ ] Message suit Conventional Commits
- [ ] Scope approprié
- [ ] Référence issue si applicable
- [ ] Breaking changes documentés
- [ ] .gitignore à jour (pas de secrets)

## Revert Commit

```bash
# Revert dernier commit (crée nouveau commit)
git revert HEAD

# Revert commit spécifique
git revert abc123

# Revert sans commit (stage changes)
git revert --no-commit HEAD
```
