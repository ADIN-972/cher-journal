# .claude Directory Structure

## Description
Ce répertoire contient des agents experts et des compétences (skills) pour guider les IA de développement sur le projet **Cher Journal**.

## Structure

```
.claude/
├── agents/              # Profils d'experts métier
│   ├── backend-expert.md
│   ├── code-reviewer.md
│   ├── database-architect.md
│   ├── debugger.md
│   ├── doc-writer.md
│   ├── react-expert.md
│   └── test-runner.md
│
└── skills/              # Compétences/Commandes
    ├── build/SKILL.md
    ├── changelog/SKILL.md
    ├── commit/SKILL.md
    ├── component/SKILL.md
    ├── doc/SKILL.md
    ├── migrate/SKILL.md
    ├── perf/SKILL.md
    ├── service/SKILL.md
    └── test/SKILL.md
```

## Agents (Profils d'Experts)

### Backend Expert
Expert architecture backend Node.js/TypeScript avec Fastify, Prisma, PostgreSQL.
- Architecture modules
- APIs REST
- Security patterns
- Performance

**Usage**: Pour développer/améliorer des fonctionnalités backend.

### Code Reviewer
Expert en revue de code avec focus sur sécurité, performance, architecture.
- Checklist sécurité (encryption, validation, auth)
- Performance (N+1, indexes, caching)
- Conventions du projet
- Best practices

**Usage**: Pour reviewer du code avant merge/déploiement.

### Database Architect
Expert modélisation de données, Prisma, PostgreSQL, migrations.
- Schema design
- Relations & indexes
- Migrations safe
- Performance queries

**Usage**: Pour modifier le schema ou optimiser les queries.

### Debugger
Expert résolution de bugs avec méthodologie systématique.
- Reproduction & isolation
- Outils de debug
- Problèmes fréquents Cher Journal
- Troubleshooting

**Usage**: Lors de bugs ou comportements inattendus.

### Doc Writer
Expert documentation technique (API, architecture, guides).
- API documentation
- Module documentation
- Setup guides
- Troubleshooting

**Usage**: Pour créer/mettre à jour la documentation.

### React Expert
Expert développement React (web + mobile).
- Architecture composants
- Hooks personnalisés
- State management (Zustand)
- Performance optimization

**Usage**: Pour développer l'interface admin/web/mobile.

### Test Runner
Expert tests automatisés (unitaires, intégration, e2e).
- Jest pour backend
- React Testing Library
- Playwright pour E2E
- Patterns de tests

**Usage**: Pour créer des tests ou améliorer la couverture.

## Skills (Compétences/Commandes)

### Build
Compilation et build du projet.
```
@build [environnement]
```
- Build complet monorepo
- TypeScript compilation
- Vite frontend build
- Optimisations production

### Changelog
Génération et maintenance du CHANGELOG.
```
@changelog [action] [version]
```
- Format Keep a Changelog
- Semantic versioning
- Conventional commits
- Templates

### Commit
Gestion des commits Git avec conventions.
```
@commit [type] [scope] [message]
```
- Conventional Commits
- Types (feat, fix, docs, etc.)
- Scopes du projet
- Pre-commit hooks

### Component
Création de composants React.
```
@component [type] [name] [location]
```
- UI components
- Feature components
- Pages
- Forms
- React Native

### Doc
Génération de documentation.
```
@doc [type] [subject]
```
- API documentation
- Module documentation
- Function JSDoc
- Setup guides
- Troubleshooting

### Migrate
Gestion des migrations Prisma.
```
@migrate [action] [name]
```
- Créer migrations
- Appliquer migrations
- Migrations safe (production)
- Rollback strategies

### Perf
Analyse et optimisation des performances.
```
@perf [target] [metric]
```
- Backend profiling
- Frontend optimization
- Database queries
- Caching strategies

### Service
Création de services backend (business logic).
```
@service [name] [module]
```
- Pattern service
- Separation of concerns
- Validation métier
- Transactions

### Test
Création et exécution de tests.
```
@test [type] [target]
```
- Tests unitaires (Jest)
- Tests d'intégration
- Tests E2E (Playwright)
- React component tests

## Comment Utiliser

### Avec GitHub Copilot

1. **Invoquer un Agent**:
   ```
   Je veux créer un nouveau module backend pour les notifications.
   Utilise l'agent @backend-expert pour me guider.
   ```

2. **Utiliser une Skill**:
   ```
   @component feature NotificationList features/notifications
   ```

3. **Combiner Agent + Skill**:
   ```
   Avec @backend-expert, créer un service de notifications
   puis @service notification admin
   ```

### Avec Claude ou autre IA

1. **Charger le contexte d'un agent**:
   ```
   Lis le fichier .claude/agents/backend-expert.md
   et aide-moi à créer un module d'authentification OAuth.
   ```

2. **Suivre une skill**:
   ```
   Suis le guide .claude/skills/migrate/SKILL.md
   pour créer une migration ajoutant une colonne `avatar` à User.
   ```

3. **Review de code**:
   ```
   Utilise .claude/agents/code-reviewer.md
   pour reviewer ce fichier auth.service.ts
   ```

## Personnalisation

### Ajouter un Agent
1. Créer `.claude/agents/mon-expert.md`
2. Définir: Rôle, Expertise, Directives, Exemples
3. Référencer dans ce README

### Ajouter une Skill
1. Créer `.claude/skills/ma-skill/SKILL.md`
2. Définir: Description, Usage, Exemples, Best Practices
3. Référencer dans ce README

## Avantages

✅ **Contexte Projet**: Les agents connaissent l'architecture spécifique de Cher Journal
✅ **Conventions**: Respect automatique des patterns et standards du projet
✅ **Efficacité**: Guides étape par étape pour tâches courantes
✅ **Qualité**: Checklists et best practices intégrées
✅ **Onboarding**: Nouveaux développeurs (humains ou IA) s'adaptent rapidement
✅ **Maintenabilité**: Documentation vivante qui évolue avec le projet

## Exemples d'Usage

### Créer un Nouveau Module Backend
```
1. @backend-expert: Structure du module
2. @service: Créer le service
3. @test unit: Ajouter tests unitaires
4. @test integration: Ajouter tests API
5. @doc module: Documenter le module
6. @commit feat: Commiter avec convention
```

### Débugger un Problème
```
1. @debugger: Méthodologie de debug
2. Suivre checklist de reproduction
3. Analyser logs avec outils suggérés
4. Appliquer fix
5. @test: Ajouter test de régression
```

### Optimiser les Performances
```
1. @perf: Identifier bottlenecks
2. @database-architect: Optimiser queries
3. Appliquer caching
4. @test: Benchmarks avant/après
5. @changelog: Documenter amélioration
```

### Développer Interface
```
1. @react-expert: Architecture composant
2. @component: Générer composant
3. Implémenter logique
4. @test component: Tests unitaires
5. @perf frontend: Optimiser si nécessaire
```

## Maintenance

Ces fichiers doivent être mis à jour lorsque:
- Architecture du projet change
- Nouvelles conventions adoptées
- Patterns émergents identifiés
- Problèmes récurrents résolus
- Outils/stack technique évolue

## Contributeurs

Tous les développeurs du projet peuvent améliorer ces agents et skills.
Pull requests bienvenues !
