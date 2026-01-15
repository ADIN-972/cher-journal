# Agents & Skills Disponibles

Index complet des agents et skills inclus dans ce kit d'export.

## 🤖 Agents (12 Total)

### Experts Backend & Infrastructure
1. **backend-expert.md** - Expertise Node.js, Fastify, Prisma, PostgreSQL
2. **api-security-expert.md** - Sécurité API, authentification, encryption
3. **database-architect.md** - Design et optimisation des bases de données
4. **dependency-manager.md** - Gestion des packages, npm workspaces, versions **[NEW]**

### Experts Frontend & UX
5. **react-expert.md** - React, Vite, TailwindCSS, state management
6. **context-menu-expert.md** - Menus contextuels et UI avancée

### Experts Qualité & Maintenance
7. **code-reviewer.md** - Revue de code, standards, bonnes pratiques
8. **test-runner.md** - Tests unitaires, intégration, e2e
9. **debugger.md** - Débogage, diagnostique, troubleshooting

### Experts Opérations & Documentation
10. **api-sync-expert.md** - Synchronisation, webhooks, intégrations
11. **doc-writer.md** - Documentation, API docs, guides utilisateur
12. **translation-i18n-expert.md** - Internationalisation, localisation

---

## 💡 Skills (10 Total)

### Opérations Courantes
1. **commit/** - Gestion des commits et versioning
2. **build/** - Build et compilation
3. **test/** - Tests et validation
4. **migrate/** - Migrations de données et code

### Amélioration Continue
5. **perf/** - Performance et optimisations
6. **changelog/** - Documentation des changements
7. **doc/** - Rédaction de documentation

### Développement
8. **component/** - Création et structure de composants
9. **service/** - Création et structure de services
10. **packages/** - Gestion des dépendances et packages **[NEW]**

---

## 📚 Documentation (doc/)

### Guides Complets
- **packages.md** - Gestion des packages, npm workspaces, SemVer
- **packages-templates.md** - Templates de package.json prêts à l'emploi
- **README.md** - Structure et utilisation de la documentation

---

## 🚀 Démarrage Rapide

### Pour les Packages & Dépendances
```bash
# 1. Lire le guide complet
doc/packages.md

# 2. Copier les templates
doc/packages-templates.md

# 3. Utiliser l'agent
agents/dependency-manager.md

# 4. Suivre le skill
skills/packages/SKILL.md
```

### Pour les Autres Domaines
- Consulter l'agent expert correspondant
- Utiliser le skill associé
- Référencer la documentation appropriée

---

## 📖 Comment Choisir

| Besoin | Agent | Skill | Doc |
|--------|-------|-------|-----|
| Gérer dépendances, npm, versions | dependency-manager | packages | packages.md |
| Coder backend API | backend-expert | service | - |
| Coder frontend React | react-expert | component | - |
| Réviser du code | code-reviewer | - | - |
| Faire tests | test-runner | test | - |
| Documenter | doc-writer | doc | README.md |
| Déployer/migrer | api-sync-expert | migrate | - |
| Optimiser perf | backend-expert + react-expert | perf | - |
| Sécurité | api-security-expert | - | - |
| Debugging | debugger | - | - |

---

## 💾 Tous les Agents (Détails)

### 1. backend-expert.md
**Domaine**: Node.js, Fastify, Prisma, PostgreSQL, APIs  
**Utilisé pour**: Architecture backend, design de services, optimisations DB  
**Skills associés**: service, build, migrate

### 2. api-security-expert.md
**Domaine**: Sécurité API, JWT, encryption, CORS, rate limiting  
**Utilisé pour**: Authentification, autorisation, protection données  
**Skills associés**: build

### 3. code-reviewer.md
**Domaine**: Standards de code, bonnes pratiques, revue de PR  
**Utilisé pour**: QA, validation patterns, conventions  
**Skills associés**: -

### 4. api-sync-expert.md
**Domaine**: Webhooks, synchronisation, intégrations tier  
**Utilisé pour**: Paiements Stripe, webhooks, événements  
**Skills associés**: service, migrate

### 5. context-menu-expert.md
**Domaine**: UI avancée, menus contextuels, interactions  
**Utilisé pour**: Composants UI complexes, UX  
**Skills associés**: component

### 6. database-architect.md
**Domaine**: Design DB, optimisations, migrations Prisma  
**Utilisé pour**: Schema design, queries optimisées, indices  
**Skills associés**: migrate, perf

### 7. debugger.md
**Domaine**: Debugging, diagnostique, troubleshooting  
**Utilisé pour**: Résoudre erreurs, trace execution, logs  
**Skills associés**: -

### 8. doc-writer.md
**Domaine**: Documentation, guides, API docs, README  
**Utilisé pour**: Rédaction documentation, architecture docs  
**Skills associés**: doc, changelog

### 9. react-expert.md
**Domaine**: React, Vite, TailwindCSS, state management Zustand  
**Utilisé pour**: Frontend développement, composants, state  
**Skills associés**: component, build, perf

### 10. test-runner.md
**Domaine**: Tests unitaires, intégration, e2e, coverage  
**Utilisé pour**: QA, validation features, regression testing  
**Skills associés**: test, build

### 11. translation-i18n-expert.md
**Domaine**: i18n, localisation, multi-langage  
**Utilisé pour**: Internationalisation, traductions  
**Skills associés**: component

### 12. dependency-manager.md
**Domaine**: npm workspaces, packages, SemVer, versions  
**Utilisé pour**: Gestion dépendances, monorepo, sécurité  
**Skills associés**: packages, build

---

## 🔗 Relations Agent-Skill

```
backend-expert       → service, build, migrate, perf
react-expert         → component, build, perf
database-architect   → migrate, perf
dependency-manager   → packages, build
doc-writer           → doc, changelog
test-runner          → test, build
debugger             → (diagnostic, pas de skill)
api-sync-expert      → service, migrate
code-reviewer        → (quality gate, pas de skill)
api-security-expert  → build
context-menu-expert  → component
translation-i18n    → component
```

---

## 📝 Utilisation dans Votre Projet

### Copie Simple
```bash
# Windows PowerShell
Copy-Item .\agents -Destination .\.claude\agents -Recurse
Copy-Item .\skills -Destination .\.claude\skills -Recurse
Copy-Item .\doc -Destination .\.claude\doc -Recurse

# macOS/Linux
cp -r ./agents ~/.claude/agents
cp -r ./skills ~/.claude/skills
cp -r ./doc ~/.claude/doc
```

### Personnalisation
1. Remplacer "Generic Project" par votre nom
2. Adapter les exemples d'architecture à votre structure
3. Ajuster les workflows (CI/CD scripts)
4. Ajouter/retirer agents selon vos besoins

Voir [README.md](./README.md) pour plus de détails.

---

## 📖 Références

- **Export Kit**: [README.md](./README.md)
- **Package Management**: [doc/packages.md](./doc/packages.md)
- **Package Templates**: [doc/packages-templates.md](./doc/packages-templates.md)
- **Skill Packages**: [skills/packages/SKILL.md](./skills/packages/SKILL.md)
- **Agent Dependency Manager**: [agents/dependency-manager.md](./agents/dependency-manager.md)
