# Claude Agents Export (Generic Base)

Ce dossier contient une base générique d'agents et de skills destinée à être réutilisée dans d'autres projets.

## Contenu

- **agents/**: Profils d'agents génériques (backend, sécurité, review, sync, debugger, database, dependency-manager, etc.)
- **skills/**: Compétences génériques (commit, test, migrate, perf, service, build, changelog, component, doc, packages)
- **doc/**: Documentation et rapports modèles
  - `README.md`: Guide de documentation
  - `packages.md`: Gestion complète des packages et npm workspaces

## Démarrage Rapide

Voir [README.md](./README.md) pour les instructions de copie et d'utilisation.

Pour la gestion des dépendances et des packages, consulter:
- **Guide complet**: [doc/packages.md](./doc/packages.md)
- **Agent expert**: [agents/dependency-manager.md](./agents/dependency-manager.md)
- **Skill dédié**: [skills/packages/SKILL.md](./skills/packages/SKILL.md)
