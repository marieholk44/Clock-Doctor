#!/usr/bin/env node

/**
 * This script builds the frontend-only version of the ClockTick Analyzer
 * specifically for deployment to Netlify.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building ClockTick Analyzer for Netlify deployment...');

// Ensure we're in the project root
const rootDir = process.cwd();
const clientDir = path.join(rootDir, 'client');
const distDir = path.join(rootDir, 'dist');

// Set environment variables for the build
const env = {
  ...process.env,
  VITE_STANDALONE_MODE: 'true',
};

// Create the netlify.toml file for proper deployments
const netlifyToml = `[build]
  publish = "dist"
  command = "node build-for-netlify.js"

# Redirects for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

fs.writeFileSync(path.join(rootDir, 'netlify.toml'), netlifyToml);
console.log('Created netlify.toml configuration file');

// Create _redirects file for Netlify (alternative to netlify.toml)
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
fs.writeFileSync(path.join(distDir, '_redirects'), '/* /index.html 200');
console.log('Created _redirects file for Netlify');

// Run the build command
console.log('Running Vite build...');
const buildProcess = spawn('vite', ['build'], {
  cwd: clientDir,
  env,
  stdio: 'inherit',
  shell: true
});

buildProcess.on('error', (err) => {
  console.error('Failed to run build:', err);
  process.exit(1);
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Build completed successfully!');
    console.log('\nDeployment files are ready in the dist/ directory');
    console.log('Upload this directory to Netlify for hosting');
    
    // Ensure _redirects file exists in the build output
    if (!fs.existsSync(path.join(distDir, '_redirects'))) {
      fs.writeFileSync(path.join(distDir, '_redirects'), '/* /index.html 200');
      console.log('Added _redirects file to build output');
    }
  } else {
    console.error(`Build process exited with code ${code}`);
    process.exit(code);
  }
});