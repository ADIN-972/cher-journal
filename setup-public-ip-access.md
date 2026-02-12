# Accès via IP Publique

## Étape 1 : Trouver votre IP Publique

Visitez : https://whatismyip.com ou exécutez :
```bash
curl ifconfig.me
```

Notez votre IP publique (ex: `203.0.113.45`)

## Étape 2 : Configurer le Port Forwarding sur votre Routeur

### Accéder à votre routeur

1. Ouvrez votre navigateur
2. Allez sur `http://192.168.1.1` (ou l'IP de votre routeur)
3. Connectez-vous (admin/admin ou voir l'étiquette du routeur)

### Créer les règles de Port Forwarding

Ajoutez 3 règles :

**Règle 1 : Backend**
- Nom : `Cher Journal Backend`
- Port externe : `3000`
- IP locale : `192.168.1.23`
- Port local : `3000`
- Protocole : TCP

**Règle 2 : Web App**
- Nom : `Cher Journal Web`
- Port externe : `5173`
- IP locale : `192.168.1.23`
- Port local : `5173`
- Protocole : TCP

**Règle 3 : Admin App**
- Nom : `Cher Journal Admin`
- Port externe : `5174`
- IP locale : `192.168.1.23`
- Port local : `5174`
- Protocole : TCP

## Étape 3 : Mettre à jour le Backend (.env)

Ouvrez `apps/backend/.env` et ajoutez votre IP publique au CORS :

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://192.168.1.23:5173,http://192.168.1.23:5174,http://146.70.228.110:5173,http://146.70.228.110:5174,http://VOTRE_IP_PUBLIQUE:5173,http://VOTRE_IP_PUBLIQUE:5174
```

Remplacez `VOTRE_IP_PUBLIQUE` par votre vraie IP (ex: `203.0.113.45`)

## Étape 4 : Redémarrer le Backend

```bash
# Arrêter le backend (Ctrl+C)
cd apps/backend
npm run dev
```

## Étape 5 : Tester depuis l'extérieur

Depuis un appareil **hors de votre réseau local** (données mobiles par exemple) :

- **Web App** : `http://VOTRE_IP_PUBLIQUE:5173`
- **Admin** : `http://VOTRE_IP_PUBLIQUE:5174`
- **Backend API** : `http://VOTRE_IP_PUBLIQUE:3000`

Les apps Web et Admin utiliseront automatiquement le proxy Vite qui pointera vers le backend local.

## ⚠️ Notes Importantes

### Sécurité

❌ **Ne faites PAS cela en production !**
- Aucun HTTPS (données en clair)
- Ports exposés directement
- Pas de firewall applicatif

✅ **Pour tester c'est OK**, mais pour une utilisation réelle, utilisez :
- Cloudflare Tunnel (gratuit, HTTPS automatique)
- VPS avec reverse proxy nginx + Let's Encrypt
- Cloudflare Pages/Workers

### IP Publique Dynamique

Si votre FAI vous donne une IP dynamique (change régulièrement) :
- Elle peut changer après un redémarrage de votre box
- Utilisez un service DynDNS (No-IP, DuckDNS) pour avoir un nom de domaine qui suit votre IP

### Pare-feu Windows

Si ça ne marche pas, vérifiez le pare-feu Windows :

1. Ouvrir "Pare-feu Windows Defender"
2. Cliquer "Paramètres avancés"
3. "Règles de trafic entrant" > "Nouvelle règle"
4. Type : Port
5. Protocole : TCP
6. Ports : `3000,5173,5174`
7. Action : Autoriser
8. Profil : Tous
9. Nom : "Cher Journal Ports"

## Commandes Rapides

### Vérifier si les ports sont ouverts (depuis l'extérieur)

Utilisez : https://www.yougetsignal.com/tools/open-ports/

Ou installez `nmap` et testez :
```bash
nmap -p 3000,5173,5174 VOTRE_IP_PUBLIQUE
```

### Voir les connexions actives sur vos ports

```cmd
netstat -ano | findstr ":3000"
netstat -ano | findstr ":5173"
netstat -ano | findstr ":5174"
```

## Dépannage

### "Connection refused"
- ✅ Vérifiez que les apps écoutent sur `0.0.0.0` (c'est déjà le cas)
- ✅ Vérifiez le port forwarding sur le routeur
- ✅ Vérifiez le pare-feu Windows

### "CORS Error"
- ✅ Ajoutez l'IP publique dans CORS_ORIGINS du backend
- ✅ Redémarrez le backend

### Impossible de se connecter
- ✅ Testez d'abord en local : `http://192.168.1.23:5173`
- ✅ Vérifiez votre IP publique (elle peut avoir changé)
- ✅ Testez avec les données mobiles (pas le WiFi)
