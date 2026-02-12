/**
 * Script to configure public URLs for external access
 * Usage: node configure-public-urls.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🌐 Configuration des URLs publiques pour Cher Journal\n');

  // Get URLs from user
  const backendUrl = await question('URL publique du Backend (ex: https://abc123.trycloudflare.com): ');
  const webUrl = await question('URL publique du Web App (ex: https://def456.trycloudflare.com): ');
  const adminUrl = await question('URL publique de l\'Admin App (ex: https://ghi789.trycloudflare.com): ');

  console.log('\n📝 Configuration en cours...\n');

  // 1. Update backend .env
  const backendEnvPath = path.join(__dirname, 'apps', 'backend', '.env');
  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');

  // Extract existing CORS_ORIGINS
  const corsMatch = backendEnv.match(/CORS_ORIGINS=(.+)/);
  if (corsMatch) {
    const existingOrigins = corsMatch[1].split(',').map(o => o.trim());

    // Add new URLs if not already present
    const newOrigins = [...existingOrigins];
    if (webUrl && !newOrigins.includes(webUrl)) {
      newOrigins.push(webUrl);
    }
    if (adminUrl && !newOrigins.includes(adminUrl)) {
      newOrigins.push(adminUrl);
    }

    const newCorsLine = `CORS_ORIGINS=${newOrigins.join(',')}`;
    backendEnv = backendEnv.replace(/CORS_ORIGINS=.+/, newCorsLine);

    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log('✅ Backend .env mis à jour avec CORS');
  }

  // 2. Update web vite.config.ts
  const webViteConfigPath = path.join(__dirname, 'apps', 'web', 'vite.config.ts');
  let webViteConfig = fs.readFileSync(webViteConfigPath, 'utf8');

  if (backendUrl) {
    webViteConfig = webViteConfig.replace(
      /target: "http:\/\/192\.168\.1\.23:3000"/g,
      `target: "${backendUrl}"`
    );
    fs.writeFileSync(webViteConfigPath, webViteConfig);
    console.log('✅ Web App vite.config.ts mis à jour');
  }

  // 3. Update admin vite.config.ts
  const adminViteConfigPath = path.join(__dirname, 'apps', 'admin', 'vite.config.ts');
  let adminViteConfig = fs.readFileSync(adminViteConfigPath, 'utf8');

  if (backendUrl) {
    adminViteConfig = adminViteConfig.replace(
      /target: "http:\/\/192\.168\.1\.23:3000"/g,
      `target: "${backendUrl}"`
    );
    fs.writeFileSync(adminViteConfigPath, adminViteConfig);
    console.log('✅ Admin App vite.config.ts mis à jour');
  }

  console.log('\n🎉 Configuration terminée!\n');
  console.log('📋 URLs configurées:');
  console.log(`   Backend:  ${backendUrl}`);
  console.log(`   Web App:  ${webUrl}`);
  console.log(`   Admin:    ${adminUrl}\n`);

  console.log('⚠️  IMPORTANT: Redémarrez maintenant les apps:');
  console.log('   1. Arrêtez backend (Ctrl+C)');
  console.log('   2. Arrêtez web (Ctrl+C)');
  console.log('   3. Arrêtez admin (Ctrl+C)');
  console.log('   4. Relancez: npm run dev dans chaque dossier\n');

  rl.close();
}

main().catch(console.error);
