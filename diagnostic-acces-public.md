# Diagnostic - Accès Public Non Fonctionnel

## État Actuel ✅

- ✅ Backend en cours d'exécution sur port 3000 (PID 170620)
- ✅ Web App en cours d'exécution sur port 5173 (PID 244424)
- ✅ Admin en cours d'exécution sur port 5174 (PID 117152)
- ✅ Pare-feu Windows configuré (règle "Cher Journal Ports" active)
- ✅ CORS configuré avec IP publique: 83.203.54.112
- ✅ Applications écoutent sur 0.0.0.0 (accessible de partout)

## Problème Probable

Le **Port Forwarding** n'est pas configuré sur votre routeur, ou votre FAI bloque les ports.

---

## SOLUTION 1 : Configurer le Port Forwarding (Recommandé)

### Étape 1 : Accéder à votre routeur

Trouvez l'IP de votre routeur :
```bash
ipconfig | findstr "Passerelle"
```

Généralement c'est : **192.168.1.1** ou **192.168.0.1**

Ouvrez cette adresse dans votre navigateur et connectez-vous.

### Étape 2 : Trouver la section Port Forwarding

Cherchez dans le menu du routeur :
- **"Port Forwarding"**
- **"NAT/PAT"**
- **"Virtual Server"**
- **"Applications & Gaming"**
- **"Serveurs virtuels"**

### Étape 3 : Créer les 3 règles

**Règle 1 - Backend API:**
```
Nom/Service : Cher Journal Backend
Port Externe : 3000
IP Interne : 192.168.1.23
Port Interne : 3000
Protocole : TCP
```

**Règle 2 - Web App:**
```
Nom/Service : Cher Journal Web
Port Externe : 5173
IP Interne : 192.168.1.23
Port Interne : 5173
Protocole : TCP
```

**Règle 3 - Admin:**
```
Nom/Service : Cher Journal Admin
Port Externe : 5174
IP Interne : 192.168.1.23
Port Interne : 5174
Protocole : TCP
```

### Étape 4 : Sauvegarder et Redémarrer le routeur

Cliquez sur "Appliquer" ou "Sauvegarder". Certains routeurs nécessitent un redémarrage.

---

## SOLUTION 2 : Utiliser Cloudflare Tunnel (Plus Simple)

Si vous n'arrivez pas à configurer le port forwarding ou si votre FAI bloque les ports :

### Installation Cloudflare

1. **Téléchargez cloudflared** :
   https://github.com/cloudflare/cloudflared/releases/latest

2. **Lancez les 3 tunnels** (dans 3 terminaux séparés) :

```bash
# Terminal 1 - Backend
cloudflared tunnel --url http://localhost:3000

# Terminal 2 - Web App
cloudflared tunnel --url http://localhost:5173

# Terminal 3 - Admin
cloudflared tunnel --url http://localhost:5174
```

3. **Notez les 3 URLs** (format: `https://xxx.trycloudflare.com`)

4. **Configurez les apps** :

```bash
node configure-public-urls.js
```

Entrez les 3 URLs cloudflare et redémarrez tout.

**Avantages** :
- ✅ Pas besoin de toucher au routeur
- ✅ HTTPS automatique (sécurisé)
- ✅ Fonctionne même si votre FAI bloque les ports
- ✅ Gratuit

**Inconvénient** :
- ⚠️ Les URLs changent à chaque redémarrage (version gratuite)

---

## Tests de Diagnostic

### Test 1 : Accès Local depuis Windows

Ouvrez votre navigateur sur **votre PC** et testez :
- http://192.168.1.23:3000/health
- http://192.168.1.23:5173
- http://192.168.1.23:5174

✅ Si ça marche : Les apps fonctionnent localement.

### Test 2 : Accès depuis un autre device sur le réseau local

Depuis votre téléphone **connecté en WiFi** (même réseau), testez :
- http://192.168.1.23:5173
- http://192.168.1.23:5174

✅ Si ça marche : Le problème est bien le port forwarding.

### Test 3 : Vérifier si les ports sont ouverts depuis l'extérieur

Depuis votre téléphone **en données mobiles** (hors réseau), allez sur :
https://www.yougetsignal.com/tools/open-ports/

Entrez :
- IP : `83.203.54.112`
- Port : `3000`

Cliquez "Check". Si ça dit **"Closed"** → Le port forwarding n'est pas configuré.

Testez aussi les ports `5173` et `5174`.

---

## Problèmes Courants

### "Port fermé" après configuration du routeur

**Cause possible** : Votre FAI bloque les ports.

**Solution** : Certains FAI (surtout les box 4G/5G) bloquent les ports entrants. Dans ce cas, utilisez **Cloudflare Tunnel** (SOLUTION 2).

### "Connection refused"

**Cause** : Le port forwarding pointe vers la mauvaise IP.

**Solution** : Vérifiez que l'IP interne est bien `192.168.1.23` dans les règles du routeur.

### "Timeout"

**Cause** : Le pare-feu du routeur bloque les connexions.

**Solution** : Dans les paramètres du routeur, cherchez "Firewall" ou "Sécurité" et vérifiez qu'il n'y a pas de règles bloquant les ports 3000, 5173, 5174.

---

## Recommandation

Si la configuration du port forwarding est compliquée ou ne fonctionne pas, **utilisez Cloudflare Tunnel (SOLUTION 2)**. C'est :
- Plus simple (pas besoin de toucher au routeur)
- Plus sécurisé (HTTPS automatique)
- Plus fiable (fonctionne même avec les FAI restrictifs)
