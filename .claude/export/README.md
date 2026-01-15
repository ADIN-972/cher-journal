# Export d'Agents et Skills (Base Générique)

Ce dossier fournit une base réutilisable d'agents et de skills pour d'autres projets.

## 🚀 Démarrage Rapide

**Très pressé?** → [QUICKSTART.md](./QUICKSTART.md) (2 min) ⚡

**Nouveaux ici?** Lire dans cet ordre:
1. [MAP.md](./MAP.md) - Carte visuelle du kit (3 min) 🎯
2. [AGENTS-SKILLS.md](./AGENTS-SKILLS.md) - Index de navigation (5 min)
3. [doc/SUMMARY.md](./doc/SUMMARY.md) - Vue d'ensemble du kit (5 min)
4. Puis suivre le flux recommandé pour votre cas d'usage

**Besoin d'une vue visuelle?** Voir [MAP.md](./MAP.md)  
**Besoin du résumé final?** Voir [RECAP.md](./RECAP.md)

## Comment l'utiliser dans un nouveau projet

1. Créer le dossier `.claude/` à la racine du projet cible (s'il n'existe pas)
2. Copier les dossiers suivants dans le nouveau projet:
   - `.claude/export/agents` → `./.claude/agents`
   - `.claude/export/skills` → `./.claude/skills`
   - `.claude/export/doc` → `./.claude/doc` (optionnel)
3. Ouvrir les fichiers copiés et remplacer les références génériques ("Generic Project") par le nom de votre projet
4. (Optionnel) Ajouter `./.claude/README.md` pour décrire vos agents/skills spécifiques
5. (Optionnel) Ajouter `./.claude/settings.local.json` pour configurer vos préférences locales

## Personnalisation Recommandée

- Adapter les exemples d'architecture aux dossiers de votre projet
- Ajuster les workflows et scripts (CI, npm scripts)
- Compléter les checklists selon vos exigences
- Ajouter/retirer des agents selon vos besoins

## Structure fournie

- `agents/`: 12 profils d'agents prêts à adapter
  - backend-expert, api-security-expert, code-reviewer, api-sync-expert
  - context-menu-expert, database-architect, debugger, doc-writer
  - react-expert, test-runner, translation-i18n-expert
  - **dependency-manager**: Expert en gestion des packages et dépendances
- `skills/`: 10 compétences génériques
  - commit, build, test, perf, migrate, doc, service, changelog, component
  - **packages**: Skill dédié au Package Management et npm workspaces
- `doc/`: Guides et templates réutilisables
  - `README.md`: Structure et utilisation de la documentation
  - `packages.md`: Guide complet gestion des packages
  - `packages-templates.md`: Templates complets de `package.json` pour tous les types d'apps

## Documentation Complète

### 📦 Packages et Dépendances (NOUVEAU)
Pour les projets avec **monorepo (npm workspaces)**:

**Resources:**
1. **Guide complet**: `doc/packages.md`
   - Structure root + workspaces
   - Gestion des versions (SemVer)
   - Mise à jour et audit des dépendances
   - Commandes essentielles et troubleshooting

2. **Templates prêts à l'emploi**: `doc/packages-templates.md`
   - Templates complets de `package.json` pour:
     - Root workspace
     - Backend (Node.js + Fastify + Prisma)
     - Admin (React + Vite + TailwindCSS)
     - Web (React Reader)
     - Mobile (Expo)
     - Packages internes (types, config, utils)
     - Tests
   - Patterns d'installation et de versioning
   - Bonnes pratiques et anti-patterns

3. **Agent Expert**: `agents/dependency-manager.md`
   - Expertise en gestion des dépendances
   - Procédures opérationnelles
   - Scénarios courants avec solutions
   - Framework de décision

4. **Skill Dédié**: `skills/packages/SKILL.md`
   - Checklist d'implémentation
   - Commandes essentielles
   - Troubleshooting structuré

### Étapes d'Implémentation (Package Management)
1. Copier les templates de `packages-templates.md` dans votre projet
2. Adapter les noms et versions selon vos besoins
3. Utiliser l'agent `dependency-manager` pour gérer les mises à jour
4. Suivre le skill `packages` pour les opérations courantes

## Index Complet

Voir [AGENTS-SKILLS.md](./AGENTS-SKILLS.md) pour:
- **Liste complète** des 12 agents disponibles
- **Liste complète** des 10 skills disponibles
- **Table de correspondance** Agent ↔ Skill
- **Guide de choix** - quel agent/skill pour quel besoin
- **Relations** entre les agents et skills

## Conseils

- Gardez ces fichiers sous versioning pour suivre les personnalisations
- Centralisez les mises à jour dans un repo template si vous avez plusieurs projets
- Faites des PRs internes pour améliorer cette base
- Consultez [AGENTS-SKILLS.md](./AGENTS-SKILLS.md) avant de chercher un agent ou skill
