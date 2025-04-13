#!/usr/bin/env node

/**
 * This script cleans up the project to create a frontend-only version
 * by removing server-related files and directories.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Cleaning project for frontend-only version...');

const rootDir = process.cwd();

// Files/directories to delete
const pathsToRemove = [
  'server',
  'shared',
  'drizzle.config.ts',
  'run-standalone.js',
  'run-standalone.sh',
  'start-standalone.js',
  'start-standalone.sh',
  'switch-to-frontend-only.js',
  'switch-to-full-version.js',
  'standalone-workflow.json',
  'detect-mode.js'
];

// Delete files/directories
let removedCount = 0;
for (const itemPath of pathsToRemove) {
  const fullPath = path.join(rootDir, itemPath);
  if (fs.existsSync(fullPath)) {
    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        fs.rmdirSync(fullPath, { recursive: true });
        console.log(`✅ Removed directory: ${itemPath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed file: ${itemPath}`);
      }
      removedCount++;
    } catch (err) {
      console.error(`❌ Error removing ${itemPath}: ${err.message}`);
    }
  }
}

// Replace package.json with the frontend-only version
try {
  if (fs.existsSync(path.join(rootDir, 'package.frontend.json'))) {
    fs.copyFileSync(
      path.join(rootDir, 'package.frontend.json'),
      path.join(rootDir, 'package.json')
    );
    console.log('✅ Replaced package.json with frontend-only version');
  } else {
    console.error('❌ package.frontend.json not found');
  }
} catch (err) {
  console.error(`❌ Error replacing package.json: ${err.message}`);
}

// Create a netlify.toml file
const netlifyToml = `[build]
  publish = "dist"
  command = "npm run build"

# Redirects for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

try {
  fs.writeFileSync(path.join(rootDir, 'netlify.toml'), netlifyToml);
  console.log('✅ Created netlify.toml file');
} catch (err) {
  console.error(`❌ Error creating netlify.toml: ${err.message}`);
}

// Update the workflow configuration to use frontend-only mode
const workflowConfig = {
  "Configured Workflows": [
    {
      "name": "Start application",
      "command": "npm run dev"
    }
  ]
};

try {
  fs.writeFileSync(
    path.join(rootDir, '.replit'),
    JSON.stringify(workflowConfig, null, 2)
  );
  console.log('✅ Updated workflow configuration');
} catch (err) {
  console.error(`❌ Error updating workflow configuration: ${err.message}`);
}

console.log(`\nCleanup complete! Removed ${removedCount} server-related files/directories.`);
console.log('\nThe project is now ready for frontend-only deployment to Netlify!');
console.log('\nNext steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev (to test locally)');
console.log('3. Run: npm run build (to build for production)');
console.log('4. Push to GitHub and connect to Netlify');