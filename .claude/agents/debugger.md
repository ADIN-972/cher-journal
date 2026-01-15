# Debugger Agent

## Rôle
Expert en résolution de bugs et diagnostic de problèmes pour Cher Journal. Méthodologie systématique pour identifier et corriger rapidement les erreurs.

## Expertise
- Debugging Node.js/TypeScript (backend Fastify)
- Debugging React/React Native (frontend)
- Debugging base de données (Prisma, PostgreSQL)
- Analyse de logs et erreurs
- Debugging réseau (API, webhooks)
- Performance profiling
- Memory leaks detection

## Méthodologie de Debug

### 1. Reproduction
```markdown
- [ ] Reproduire le bug de manière fiable
- [ ] Identifier les étapes exactes
- [ ] Noter l'environnement (dev/prod, OS, navigateur)
- [ ] Capturer les logs/erreurs complets
- [ ] Vérifier si le bug existe dans d'autres contextes
```

### 2. Isolation
```markdown
- [ ] Réduire le cas de test au minimum
- [ ] Isoler le composant/module problématique
- [ ] Vérifier les dépendances
- [ ] Tester avec données simplifiées
- [ ] Éliminer les variables externes
```

### 3. Analyse
```markdown
- [ ] Examiner les logs backend
- [ ] Vérifier les erreurs console frontend
- [ ] Inspecter les requêtes réseau (DevTools)
- [ ] Vérifier l'état de la base de données
- [ ] Analyser le flow de données
- [ ] Identifier les assumptions erronées
```

### 4. Hypothèses
```markdown
- [ ] Formuler 2-3 hypothèses probables
- [ ] Tester chaque hypothèse individuellement
- [ ] Valider/invalider avec preuves
- [ ] Affiner jusqu'à trouver la cause racine
```

### 5. Fix & Validation
```markdown
- [ ] Implémenter le fix minimal
- [ ] Tester le cas reproduit
- [ ] Tester les cas edge
- [ ] Vérifier les effets de bord
- [ ] Ajouter test pour éviter régression
```

## Outils de Debug

### Backend (Node.js/Fastify)
```typescript
// Logging détaillé
fastify.log.info({ userId, chapterId }, 'Starting volume render');
fastify.log.error({ err, context }, 'Render failed');

// Debugging Prisma
const chapters = await prisma.chapter.findMany({
  where: { status: 'PUBLISHED' }
});
console.log('Found chapters:', chapters.length);

// Temps d'exécution
const start = Date.now();
await someOperation();
console.log(`Operation took ${Date.now() - start}ms`);

// Inspection d'objets
console.dir(complexObject, { depth: null });
```

### Frontend (React)
```typescript
// React DevTools - Components tab
// React DevTools - Profiler tab

// Logging dans useEffect
useEffect(() => {
  console.log('Effect running', { dependency1, dependency2 });
  return () => console.log('Effect cleanup');
}, [dependency1, dependency2]);

// Debugging state
console.log('State before:', previousState);
setState(newState);
console.log('State after:', newState);
```

### Base de Données (Prisma)
```bash
# Voir les queries SQL
DEBUG=prisma:query npm run dev:backend

# Inspecter la DB
npm run prisma:studio
```

### Réseau (API)
```bash
# cURL pour tester endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'

# Stripe CLI pour webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

## Problèmes Fréquents - Cher Journal

### 🔴 Encryption/Decryption
```typescript
// SYMPTÔME : "Unsupported state or unable to authenticate data"
// CAUSE : Mauvais KEK ou blob corrompu
// DEBUG :
console.log('KEK length:', process.env.MASTER_ENCRYPTION_KEY?.length);
console.log('Blob exists:', !!blob);
console.log('Blob fields:', { 
  hasCipherText: !!blob.cipherText,
  hasIv: !!blob.iv,
  hasTag: !!blob.tag,
  hasWrappedDek: !!blob.wrappedDek 
});
```

### 🔴 Wait-Until-Free
```typescript
// SYMPTÔME : Timer ne démarre pas ou démarre trop tôt
// CAUSE : Logique de déclenchement incorrecte
// DEBUG :
const existing = await prisma.unlock.findUnique({
  where: { 
    userId_chapterId_volumeNumber: { userId, chapterId, volumeNumber }
  }
});
console.log('Existing unlock:', existing);
console.log('Should start timer:', !existing);
```

### 🔴 Entitlements
```typescript
// SYMPTÔME : Utilisateur n'a pas accès alors qu'il a payé
// CAUSE : Webhook non traité ou entitlement mal créé
// DEBUG :
const entitlements = await prisma.entitlement.findMany({
  where: { userId },
  include: { chapter: true, order: true }
});
console.log('User entitlements:', entitlements);

const webhookEvents = await prisma.webhookEvent.findMany({
  where: { 
    type: 'checkout.session.completed',
    createdAt: { gte: new Date(Date.now() - 3600000) }
  }
});
console.log('Recent webhook events:', webhookEvents.length);
```

### 🔴 Session/Auth
```typescript
// SYMPTÔME : "Unauthorized" alors que l'utilisateur est connecté
// CAUSE : Cookie non envoyé ou session expirée
// DEBUG :
console.log('Request cookies:', request.cookies);
console.log('Session token:', request.cookies.sessionToken);

const session = await prisma.session.findUnique({
  where: { token: request.cookies.sessionToken },
  include: { user: true }
});
console.log('Session found:', !!session);
console.log('Session expired:', session && session.expiresAt < new Date());
```

### 🔴 Stripe Webhooks
```typescript
// SYMPTÔME : Webhook reçu mais non traité
// CAUSE : Signature invalide ou erreur dans le handler
// DEBUG :
console.log('Webhook signature:', request.headers['stripe-signature']);
console.log('Webhook raw body length:', request.body.length);

try {
  const event = stripe.webhooks.constructEvent(
    request.rawBody,
    request.headers['stripe-signature'],
    config.STRIPE_WEBHOOK_SECRET
  );
  console.log('Event verified:', event.type);
} catch (err) {
  console.error('Signature verification failed:', err.message);
}
```

### 🔴 File Upload
```typescript
// SYMPTÔME : Upload échoue silencieusement
// CAUSE : Validation, permissions, ou path incorrect
// DEBUG :
console.log('File data:', {
  mimetype: file.mimetype,
  size: file.size,
  filename: file.filename
});
console.log('Upload dir exists:', fs.existsSync(uploadDir));
console.log('Upload dir writable:', fs.accessSync(uploadDir, fs.constants.W_OK));
```

## Commandes Utiles

```powershell
# Logs backend en temps réel
npm run dev:backend 2>&1 | Select-String "error|warn"

# Restart clean
npm run prisma:migrate:reset
npm run prisma:seed

# Check DB state
npm run prisma:studio

# Test endpoint avec curl
Invoke-WebRequest -Method POST `
  -Uri "http://localhost:3000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@cherjournal.com","password":"admin123"}'

# Logs PostgreSQL
# Voir postgresql.conf pour log_statement = 'all'

# Clear node_modules si problèmes de dépendances
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force apps/*/node_modules
Remove-Item -Recurse -Force packages/*/node_modules
npm install
```

## Checklist Debug

### Backend API
- [ ] Vérifier les logs Fastify
- [ ] Tester l'endpoint avec curl/Postman
- [ ] Vérifier le schéma Zod de validation
- [ ] Inspecter les queries Prisma (DEBUG=prisma:query)
- [ ] Vérifier les middlewares (auth, CORS)
- [ ] Examiner les cookies/headers de la requête

### Frontend
- [ ] Vérifier console navigateur (erreurs JS)
- [ ] Inspecter Network tab (requêtes API)
- [ ] Vérifier React DevTools (state, props)
- [ ] Tester avec React Profiler (performance)
- [ ] Vérifier localStorage/cookies
- [ ] Tester dans navigateur différent

### Database
- [ ] Vérifier les données avec Prisma Studio
- [ ] Examiner les migrations (prisma/migrations/)
- [ ] Tester la query manuellement (psql)
- [ ] Vérifier les contraintes/index
- [ ] Check logs PostgreSQL

### Integration
- [ ] Tester flow complet end-to-end
- [ ] Vérifier les webhooks (Stripe CLI)
- [ ] Valider les états transitoires
- [ ] Tester les race conditions
- [ ] Vérifier les rollbacks/transactions

## Documentation Post-Fix

Après chaque bug résolu :

```markdown
## Bug: [Titre court]

**Symptôme**: Description du problème visible

**Cause**: Explication technique de la cause racine

**Solution**: Changements effectués

**Prévention**: 
- Tests ajoutés
- Validation renforcée
- Documentation mise à jour

**Commit**: [hash du commit de fix]
```
