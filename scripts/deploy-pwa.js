#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Deploying FitTracker PWA to Vercel...\n');

try {
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('📦 Installing Vercel CLI...');
    execSync('pnpm add -g vercel', { stdio: 'inherit' });
  }

  // Build the PWA
  console.log('🔨 Building PWA...');
  execSync('pnpm build:pwa', { stdio: 'inherit' });

  // Deploy to Vercel
  console.log('🌐 Deploying to Vercel...');
  const deployOutput = execSync('vercel --prod --yes', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  // Extract URL from deploy output
  const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
  const deployedUrl = urlMatch ? urlMatch[0] : 'Check Vercel dashboard for URL';
  
  console.log('\n🎉 Deployment successful!');
  console.log(`📱 Your PWA is live at: ${deployedUrl}`);
  console.log('\n🔧 Next steps for APK conversion:');
  console.log(`1. Test PWA: ${deployedUrl}`);
  console.log(`2. Run: bubblewrap init --manifest=${deployedUrl}/manifest.json`);
  console.log('3. Run: bubblewrap build');
  console.log('4. Your APK will be ready for testing!');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\n💡 Manual deployment options:');
  console.log('- Vercel: pnpm add -g vercel && vercel --prod');
  console.log('- Netlify: pnpm add -g netlify-cli && netlify deploy --prod --dir=out');
  console.log('- GitHub Pages: Push to GitHub and enable Pages');
}
