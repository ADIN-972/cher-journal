/**
 * Script to add your public IP to CORS origins
 * Usage: node add-public-ip-to-cors.js [YOUR_PUBLIC_IP]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.ip);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🌐 Configuration de l\'accès via IP publique\n');

  // Get public IP
  let publicIP = process.argv[2];

  if (!publicIP) {
    console.log('📡 Récupération de votre IP publique...');
    try {
      publicIP = await getPublicIP();
      console.log(`✅ IP publique détectée : ${publicIP}\n`);
    } catch (error) {
      console.error('❌ Impossible de récupérer l\'IP publique automatiquement');
      console.error('   Visitez https://whatismyip.com et relancez :');
      console.error('   node add-public-ip-to-cors.js VOTRE_IP\n');
      process.exit(1);
    }
  }

  // Validate IP format
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(publicIP)) {
    console.error('❌ Format d\'IP invalide:', publicIP);
    process.exit(1);
  }

  // Update backend .env
  const backendEnvPath = path.join(__dirname, 'apps', 'backend', '.env');

  if (!fs.existsSync(backendEnvPath)) {
    console.error('❌ Fichier .env introuvable:', backendEnvPath);
    process.exit(1);
  }

  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');

  // Extract existing CORS_ORIGINS
  const corsMatch = backendEnv.match(/CORS_ORIGINS=(.+)/);

  if (!corsMatch) {
    console.error('❌ CORS_ORIGINS non trouvé dans le .env');
    process.exit(1);
  }

  const existingOrigins = corsMatch[1].split(',').map(o => o.trim());

  // Add new origins with public IP
  const newOrigins = [
    `http://${publicIP}:5173`,
    `http://${publicIP}:5174`
  ];

  let added = 0;
  newOrigins.forEach(origin => {
    if (!existingOrigins.includes(origin)) {
      existingOrigins.push(origin);
      added++;
    }
  });

  if (added === 0) {
    console.log('ℹ️  Les origines avec cette IP publique existent déjà dans CORS_ORIGINS');
    console.log(`   IP: ${publicIP}\n`);
  } else {
    const newCorsLine = `CORS_ORIGINS=${existingOrigins.join(',')}`;
    backendEnv = backendEnv.replace(/CORS_ORIGINS=.+/, newCorsLine);

    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log(`✅ ${added} origine(s) ajoutée(s) à CORS_ORIGINS`);
    console.log(`   - http://${publicIP}:5173`);
    console.log(`   - http://${publicIP}:5174\n`);
  }

  console.log('📋 Prochaines étapes :\n');
  console.log('1. 🔧 Configurez le port forwarding sur votre routeur :');
  console.log('   - Port 3000 → 192.168.1.23:3000 (Backend)');
  console.log('   - Port 5173 → 192.168.1.23:5173 (Web App)');
  console.log('   - Port 5174 → 192.168.1.23:5174 (Admin)\n');

  console.log('2. 🔄 Redémarrez le backend :');
  console.log('   cd apps/backend && npm run dev\n');

  console.log('3. 🧪 Testez depuis l\'extérieur (données mobiles) :');
  console.log(`   Web App : http://${publicIP}:5173`);
  console.log(`   Admin   : http://${publicIP}:5174\n`);

  console.log('⚠️  IMPORTANT :');
  console.log('   - Assurez-vous que le pare-feu Windows autorise ces ports');
  console.log('   - Si votre IP publique change, relancez ce script');
  console.log('   - Pour tester, utilisez les données mobiles (pas le WiFi)\n');
}

main().catch(console.error);
