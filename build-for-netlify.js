#!/usr/bin/env node

/**
 * This script builds the frontend-only version of the ClockTick Analyzer
 * specifically for deployment to Netlify.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building ClockTick Analyzer for Netlify deployment...');

const rootDir = process.cwd();

// Ensure we're using the frontend-only version
if (fs.existsSync(path.join(rootDir, 'server'))) {
  console.log('⚠️ Backend code detected! Running cleanup script first...');
  try {
    execSync('node clean-for-frontend-only.js', { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Error running cleanup script: ${err.message}`);
    process.exit(1);
  }
}

// Create redirects file for Netlify SPA
const redirectsContent = '/* /index.html 200';
const distDir = path.join(rootDir, 'dist');

// Ensure env variable is set for standalone mode
process.env.VITE_STANDALONE_MODE = 'true';

// Build the frontend
console.log('\n📦 Building frontend...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (err) {
  console.error(`❌ Build failed: ${err.message}`);
  process.exit(1);
}

// Create _redirects file in the dist directory
try {
  if (!fs.existsSync(distDir)) {
    console.error('❌ Build directory (dist) not found');
    process.exit(1);
  }
  
  fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent);
  console.log('✅ Created _redirects file for SPA routing');
} catch (err) {
  console.error(`❌ Error creating _redirects file: ${err.message}`);
}

// Create netlify.toml file if it doesn't exist
const netlifyToml = `[build]
  publish = "dist"
  command = "npm run build"

# Set environment variables
[build.environment]
  VITE_STANDALONE_MODE = "true"

# Redirects for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

if (!fs.existsSync(path.join(rootDir, 'netlify.toml'))) {
  try {
    fs.writeFileSync(path.join(rootDir, 'netlify.toml'), netlifyToml);
    console.log('✅ Created netlify.toml configuration file');
  } catch (err) {
    console.error(`❌ Error creating netlify.toml: ${err.message}`);
  }
}

console.log('\n🚀 Build for Netlify completed!');
console.log('\nYour app is ready for deployment:');
console.log('1. Upload the "dist" directory to Netlify');
console.log('2. Or connect your GitHub repository to Netlify');
console.log('   - Build command: npm run build');
console.log('   - Publish directory: dist');