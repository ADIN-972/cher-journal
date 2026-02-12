# Configuration Cloudflare Tunnel Permanent pour Cher Journal

## 1. Prérequis

- Un nom de domaine (ex: `cher-journal.com`)
- cloudflared installé: `C:\cloudflared\cloudflared.exe`
- Compte Cloudflare (gratuit): https://dash.cloudflare.com/sign-up

## 2. Ajouter votre domaine à Cloudflare

1. Connectez-vous à https://dash.cloudflare.com
2. Cliquez sur "Add a Site"
3. Entrez votre nom de domaine (ex: `cher-journal.com`)
4. Choisissez le plan **Free**
5. Cloudflare vous donnera 2 nameservers:
   - `aisha.ns.cloudflare.com`
   - `tim.ns.cloudflare.com`
6. Allez chez votre registrar (OVH, Namecheap, etc.) et changez les nameservers
7. Attendez 5-30 minutes que les DNS se propagent

## 3. Créer un tunnel persistant

Ouvrez PowerShell en tant qu'administrateur et exécutez:

```powershell
# 1. Se connecter à Cloudflare
C:\cloudflared\cloudflared.exe tunnel login
# Cela ouvre un navigateur pour autoriser cloudflared

# 2. Créer le tunnel
C:\cloudflared\cloudflared.exe tunnel create cher-journal
# Note l'ID du tunnel (ex: abc123-def456-ghi789)

# 3. Lister les tunnels pour vérifier
C:\cloudflared\cloudflared.exe tunnel list
```

## 4. Configurer les routes DNS

Pour chaque service, créez une route DNS:

```powershell
# Backend (API)
C:\cloudflared\cloudflared.exe tunnel route dns cher-journal api.votre-domaine.com

# Web App
C:\cloudflared\cloudflared.exe tunnel route dns cher-journal app.votre-domaine.com

# Admin
C:\cloudflared\cloudflared.exe tunnel route dns cher-journal admin.votre-domaine.com
```

Remplacez `votre-domaine.com` par votre vrai domaine.

## 5. Créer le fichier de configuration

Créez le fichier `C:\Users\yabon\.cloudflared\config.yml`:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\yabon\.cloudflared\<TUNNEL_ID>.json

ingress:
  # Backend API
  - hostname: api.votre-domaine.com
    service: http://localhost:3000

  # Web App
  - hostname: app.votre-domaine.com
    service: http://localhost:5173

  # Admin
  - hostname: admin.votre-domaine.com
    service: http://localhost:5174

  # Route par défaut (obligatoire)
  - service: http_status:404
```

**Important**: Remplacez:
- `<TUNNEL_ID>` par l'ID de votre tunnel
- `votre-domaine.com` par votre vrai domaine

## 6. Tester la configuration

```powershell
# Tester la configuration
C:\cloudflared\cloudflared.exe tunnel --config C:\Users\yabon\.cloudflared\config.yml run cher-journal
```

Si tout fonctionne, vous devriez pouvoir accéder à:
- `https://app.votre-domaine.com`
- `https://api.votre-domaine.com`
- `https://admin.votre-domaine.com`

## 7. Installer comme service Windows

Pour que cloudflared démarre automatiquement avec Windows:

```powershell
# Installer le service
C:\cloudflared\cloudflared.exe --config C:\Users\yabon\.cloudflared\config.yml service install

# Démarrer le service
C:\cloudflared\cloudflared.exe service start

# Vérifier le statut
C:\cloudflared\cloudflared.exe service status
```

## 8. Mettre à jour la configuration du projet

### apps/backend/.env

```env
# Mettre à jour CORS_ORIGINS
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,https://app.votre-domaine.com,https://admin.votre-domaine.com
```

### apps/web/vite.config.ts

```typescript
const targetURL = "https://api.votre-domaine.com";
```

### apps/admin/vite.config.ts

```typescript
const targetURL = "https://api.votre-domaine.com";
```

## 9. Redémarrer les services

```bash
# Redémarrer le backend
cd apps/backend
npm run dev

# Redémarrer le web
cd apps/web
npm run dev

# Redémarrer l'admin
cd apps/admin
npm run dev
```

## 10. Accéder à l'application

Vous pouvez maintenant accéder à votre application via:
- **Web App**: https://app.votre-domaine.com
- **Admin**: https://admin.votre-domaine.com
- **API**: https://api.votre-domaine.com

## Commandes utiles

```powershell
# Voir les tunnels
C:\cloudflared\cloudflared.exe tunnel list

# Voir les routes DNS
C:\cloudflared\cloudflared.exe tunnel route dns list

# Supprimer un tunnel
C:\cloudflared\cloudflared.exe tunnel delete cher-journal

# Voir les logs du service
C:\cloudflared\cloudflared.exe service status
```

## Avantages

✅ URLs fixes qui ne changent jamais
✅ HTTPS automatique avec certificat SSL
✅ Pas besoin d'ouvrir de ports sur le routeur
✅ Protection DDoS gratuite de Cloudflare
✅ Démarrage automatique avec Windows
✅ Domaine personnalisé professionnel

## Troubleshooting

**Le tunnel ne se connecte pas:**
- Vérifiez que les services locaux sont démarrés (3000, 5173, 5174)
- Vérifiez le fichier config.yml
- Regardez les logs: `C:\cloudflared\cloudflared.exe tunnel run cher-journal`

**Les DNS ne se résolvent pas:**
- Attendez 5-30 minutes après le changement de nameservers
- Vérifiez que les nameservers sont bien changés: https://www.whatsmydns.net/

**Erreurs CORS:**
- Assurez-vous que `CORS_ORIGINS` dans `.env` contient les bons domaines
- Redémarrez le backend après modification
