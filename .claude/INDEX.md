# Index des Agents et Skills - Cher Journal

## 🧠 Agents Experts

| Agent | Focus | Quand l'utiliser |
|-------|-------|------------------|
| [Backend Expert](agents/backend-expert.md) | Node.js, Fastify, Prisma, APIs | Développement backend, architecture modules |
| [Code Reviewer](agents/code-reviewer.md) | Revue qualité, sécurité, performance | Review avant merge, audit code |
| [Database Architect](agents/database-architect.md) | Prisma, PostgreSQL, migrations | Modifications schema, optimisation queries |
| [Debugger](agents/debugger.md) | Résolution bugs, troubleshooting | Comportements inattendus, erreurs |
| [Doc Writer](agents/doc-writer.md) | Documentation technique | Création/mise à jour documentation |
| [React Expert](agents/react-expert.md) | React, React Native, composants | Développement frontend/mobile |
| [Test Runner](agents/test-runner.md) | Tests unitaires, intégration, E2E | Création tests, amélioration coverage |

## ⚡ Skills (Compétences)

| Skill | Commande | Description |
|-------|----------|-------------|
| [Build](skills/build/SKILL.md) | `@build [env]` | Compilation et build du projet |
| [Changelog](skills/changelog/SKILL.md) | `@changelog [action]` | Gestion du CHANGELOG |
| [Commit](skills/commit/SKILL.md) | `@commit [type]` | Commits Git conventionnels |
| [Component](skills/component/SKILL.md) | `@component [type] [name]` | Création composants React |
| [Doc](skills/doc/SKILL.md) | `@doc [type] [subject]` | Génération documentation |
| [Migrate](skills/migrate/SKILL.md) | `@migrate [action]` | Migrations Prisma |
| [Perf](skills/perf/SKILL.md) | `@perf [target]` | Optimisation performances |
| [Service](skills/service/SKILL.md) | `@service [name]` | Création services backend |
| [Test](skills/test/SKILL.md) | `@test [type]` | Tests automatisés |

## 🔥 Workflows Fréquents

### Nouveau Feature Backend
```
1. @backend-expert → Structurer le module
2. @service feature-name admin → Créer service
3. @test unit feature.service → Tests unitaires
4. @test integration feature.routes → Tests API
5. @doc module feature-name → Documentation
6. @commit feat(feature): add feature
```

### Nouveau Composant React
```
1. @react-expert → Architecture composant
2. @component feature ComponentName features/feature
3. @test component ComponentName
4. @commit feat(ui): add ComponentName component
```

### Migration Base de Données
```
1. @database-architect → Planifier changements
2. Modifier prisma/schema.prisma
3. @migrate add_table_name
4. @test integration → Vérifier impact
5. @doc migration add_table_name
```

### Debug Problème
```
1. @debugger → Méthodologie
2. Reproduire le bug
3. Analyser avec outils debug
4. Appliquer fix
5. @test → Ajouter test régression
6. @commit fix(module): resolve issue
```

### Optimisation Performance
```
1. @perf backend → Profiling
2. @database-architect → Optimiser queries
3. Implémenter caching
4. @test → Benchmarks
5. @changelog → Documenter amélioration
```

## 📚 Référence Rapide

### Agents par Cas d'Usage

**Développement**:
- Backend → `backend-expert`
- Frontend → `react-expert`
- Database → `database-architect`

**Qualité**:
- Review → `code-reviewer`
- Tests → `test-runner`
- Debug → `debugger`

**Documentation**:
- Toute doc → `doc-writer`

### Skills par Catégorie

**Développement**:
- `@service` - Services backend
- `@component` - Composants React
- `@migrate` - Migrations DB

**Qualité**:
- `@test` - Tests automatisés
- `@perf` - Performances

**Workflow**:
- `@build` - Compilation
- `@commit` - Git commits
- `@changelog` - Historique
- `@doc` - Documentation

## 💡 Tips d'Utilisation

### Invoquer un Agent
```
"Avec @backend-expert, crée un module de statistiques"
"@code-reviewer, review ce fichier auth.service.ts"
"@debugger, aide-moi à résoudre cette erreur de décryptage"
```

### Chaîner Skills
```
"@service notifications admin puis @test unit notifications.service"
"@component form UserForm puis @test component UserForm"
```

### Contexte Projet
Tous les agents/skills connaissent:
- Architecture monorepo
- Stack technique (Fastify, Prisma, React)
- Patterns du projet (encryption, wait-until-free, etc.)
- Conventions de code

## 🎯 Checklist Complète

### Avant de Commiter
- [ ] Code fonctionne localement
- [ ] Tests passent (`npm test`)
- [ ] Pas de console.log/debugger
- [ ] Code formaté (prettier/eslint)
- [ ] Message commit conventionnel
- [ ] Documentation à jour si nécessaire

### Avant PR/Merge
- [ ] Review avec `@code-reviewer`
- [ ] Tests coverage > 80%
- [ ] Migrations testées
- [ ] CHANGELOG.md mis à jour
- [ ] Breaking changes documentés
- [ ] CI/CD passe

### Avant Déploiement
- [ ] Backup base de données (si migrations)
- [ ] Variables d'env configurées
- [ ] Build production testé
- [ ] Plan de rollback défini
- [ ] Monitoring en place

## 📞 Support

Pour questions ou améliorations:
1. Consulter documentation projet (README.md, API.md)
2. Lire l'agent/skill approprié
3. Ouvrir issue GitHub si nécessaire

## 🔄 Mise à Jour

Cette structure évolue avec le projet. Mises à jour lors de:
- Changements architecture
- Nouvelles conventions
- Patterns émergents
- Problèmes récurrents identifiés
