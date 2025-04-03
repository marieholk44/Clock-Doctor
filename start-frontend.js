#!/usr/bin/env node

// This script starts the frontend-only version of the ClockTick Analyzer
// No backend/server requirements - runs everything in the browser with localStorage

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const cwd = process.cwd();

// Make sure theme.json file exists in client directory
const themeJsonPath = path.join(cwd, 'theme.json');
const clientThemeJsonPath = path.join(cwd, 'client', 'theme.json');

// Copy the theme.json file from root to client if it doesn't exist
if (fs.existsSync(themeJsonPath) && !fs.existsSync(clientThemeJsonPath)) {
  console.log('Copying theme.json to client directory...');
  fs.copyFileSync(themeJsonPath, clientThemeJsonPath);
}

// Set environment variables for standalone mode
process.env.STANDALONE = 'true';

console.log('Starting ClockTick Analyzer in frontend-only mode...');
console.log('This will use localStorage for data persistence.');
console.log('No server/backend is required to run this application.');

// Start the Vite development server for the client
const viteProcess = spawn('npx', ['vite', 'serve', 'client', '--host', '0.0.0.0', '--port', '5173'], {
  cwd,
  stdio: 'inherit',
  env: {
    ...process.env,
    STANDALONE: 'true'
  }
});

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite server:', err);
  process.exit(1);
});

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('Shutting down...');
  viteProcess.kill('SIGINT');
  process.exit(0);
});

console.log('Frontend-only mode initialized!');
console.log('App is running at http://localhost:5173');