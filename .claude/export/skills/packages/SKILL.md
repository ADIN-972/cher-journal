# Skill: Package Management

Manage project dependencies, npm workspaces, versions, and package.json configurations across a Generic Project monorepo.

## Scope

This skill encompasses:
- **Dependency management**: Adding, updating, auditing, and removing packages
- **Workspace configuration**: Setting up and maintaining npm workspaces
- **Version management**: Applying SemVer versioning, updating versions
- **Package.json optimization**: Consolidating scripts, optimizing configurations
- **Security auditing**: Running npm audit, addressing vulnerabilities
- **Migration workflows**: Upgrading major versions, dependency migrations

## Typical Tasks

```
- "Update all dependencies in the backend workspace"
- "Add axios as a shared dependency in all frontend apps"
- "Bump the version from 1.0.0 to 1.1.0 for the API package"
- "Run security audit and fix all vulnerabilities"
- "Consolidate duplicate npm scripts across workspaces"
- "Setup npm workspaces for a new monorepo"
- "Configure shared TypeScript and Prettier at root level"
```

## Checklist

### Before Starting
- [ ] Understand the monorepo structure (apps, packages, root)
- [ ] Review current package.json files for inconsistencies
- [ ] Identify which changes affect multiple workspaces
- [ ] Check for circular dependencies or conflicts

### During Implementation
- [ ] Validate changes don't break existing scripts
- [ ] Test installation in affected workspaces (`npm install`)
- [ ] Run security audit (`npm audit`)
- [ ] Verify all workspaces can still build/run after changes

### After Completion
- [ ] Update version numbers if major changes made
- [ ] Document any new configuration patterns
- [ ] Create a summary of what changed in each workspace
- [ ] Test full dev environment startup

## Key Commands

```bash
# Information & Auditing
npm ls --depth=0                           # List dependencies
npm outdated                               # Check for outdated packages
npm audit                                  # Security audit
npm audit fix                              # Auto-fix vulnerabilities

# Workspace Management
npm install                                # Install all workspaces
npm install lodash --workspaces            # Install to all workspaces
npm install --save-dev typescript --workspace=@project/backend  # Install to specific

# Version Updates
npm update                                 # Update packages (safe - patch/minor only)
npm install package@latest                 # Install specific version
npm version major|minor|patch              # Bump version

# Maintenance
npm prune                                  # Remove unused dependencies
npm clean-install                          # Clean reinstall (CI-safe)
```

## Common Patterns

### Root package.json
- Consolidate dev dependencies (TypeScript, linters, formatters)
- Define workspace metadata
- Create convenience scripts for multi-workspace operations

### Backend package.json
- Include server runtime deps (Fastify, ORM, validation)
- Include dev tools (build, testing, database)
- Define startup and build scripts

### Frontend package.json (React, Vue, etc.)
- Include UI frameworks and helpers
- Include build tool config (Vite, Webpack)
- Define dev server and build scripts

### Shared Package package.json
- Keep dependencies minimal (only essentials)
- Define build output (main, types, exports)
- Version independently from apps

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot find module 'package'` | Verify package in package.json, run `npm install` |
| `ERESOLVE unable to resolve dependency tree` | Use `npm install --legacy-peer-deps` or update conflicting deps |
| `peer dep warning` | Add missing peer dependency or suppress if intentional |
| `Duplicate packages in node_modules` | Run `npm dedupe` to consolidate |

## References

- [npm workspaces docs](https://docs.npmjs.com/cli/latest/using-npm/workspaces)
- [Semantic Versioning](https://semver.org/)
- [npm audit guide](https://docs.npmjs.com/auditing-package-contents-for-security-vulnerabilities)
- [package.json reference](https://docs.npmjs.com/cli/latest/configuring-npm/package-json)
