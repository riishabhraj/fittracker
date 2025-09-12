#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building PWA for APK conversion...\n');

// Build the Next.js app
console.log('📦 Building Next.js application...');
try {
  execSync('pnpm build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check for required PWA files
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/fittracker-app-icon.png'
];

console.log('🔍 Checking PWA requirements...');
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🎉 PWA build ready for APK conversion!');
console.log('\nNext steps:');
console.log('1. Deploy your app to a domain (Vercel, Netlify, etc.)');
console.log('2. Use Bubblewrap or PWABuilder to create APK');
console.log('3. Test the APK on Android device');
