#!/usr/bin/env node

/**
 * This script switches the project to frontend-only mode by:
 * 1. Backing up the original package.json
 * 2. Copying package.frontend.json to package.json
 * 3. Providing instructions for running the frontend-only version
 */

const fs = require('fs');
const path = require('path');

console.log('Switching to frontend-only version of ClockTick Analyzer...');

// Paths to files
const rootDir = process.cwd();
const originalPackageJsonPath = path.join(rootDir, 'package.json');
const frontendPackageJsonPath = path.join(rootDir, 'package.frontend.json');
const backupPackageJsonPath = path.join(rootDir, 'package.full.json');

// Check if frontend package.json exists
if (!fs.existsSync(frontendPackageJsonPath)) {
  console.error('Error: package.frontend.json not found.');
  console.error('This file is required to switch to the frontend-only version.');
  process.exit(1);
}

// Backup original package.json if needed
if (fs.existsSync(originalPackageJsonPath) && !fs.existsSync(backupPackageJsonPath)) {
  console.log('Backing up original package.json to package.full.json...');
  fs.copyFileSync(originalPackageJsonPath, backupPackageJsonPath);
}

// Copy frontend package.json to package.json
console.log('Copying frontend-only package.json...');
fs.copyFileSync(frontendPackageJsonPath, originalPackageJsonPath);

console.log('\n✅ Successfully switched to frontend-only version!');
console.log('\nTo run the application:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
console.log('\nTo switch back to the full version:');
console.log('Run: node switch-to-full-version.js');

// Create the switch back script if it doesn't exist
const switchBackScriptPath = path.join(rootDir, 'switch-to-full-version.js');
if (!fs.existsSync(switchBackScriptPath)) {
  const switchBackScript = `#!/usr/bin/env node

/**
 * This script switches the project back to the full version by:
 * 1. Copying package.full.json back to package.json
 */

const fs = require('fs');
const path = require('path');

console.log('Switching back to full version of ClockTick Analyzer...');

// Paths to files
const rootDir = process.cwd();
const originalPackageJsonPath = path.join(rootDir, 'package.json');
const backupPackageJsonPath = path.join(rootDir, 'package.full.json');

// Check if backup package.json exists
if (!fs.existsSync(backupPackageJsonPath)) {
  console.error('Error: package.full.json not found.');
  console.error('Cannot switch back to the full version without the backup.');
  process.exit(1);
}

// Copy backup package.json to package.json
console.log('Restoring original package.json...');
fs.copyFileSync(backupPackageJsonPath, originalPackageJsonPath);

console.log('\\n✅ Successfully switched back to the full version!');
console.log('\\nTo run the application:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
`;

  fs.writeFileSync(switchBackScriptPath, switchBackScript);
  fs.chmodSync(switchBackScriptPath, '755');
  console.log('\nCreated switch-to-full-version.js script for switching back.');
}

// Make the script executable
fs.chmodSync(__filename, '755');