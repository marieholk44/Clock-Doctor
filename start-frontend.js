#!/usr/bin/env node

/**
 * This script starts the frontend-only version of the ClockTick Analyzer.
 * It configures and launches a Vite development server for the client-side app.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure we're in the project root
const rootDir = process.cwd();
const clientDir = path.join(rootDir, 'client');

console.log('Starting ClockTick Analyzer in frontend-only mode...');

// Make sure client directory exists
if (!fs.existsSync(clientDir)) {
  console.error('Error: Client directory not found.');
  console.error('Expected client directory at:', clientDir);
  process.exit(1);
}

// Start the Vite server with env variables for standalone mode
const env = {
  ...process.env,
  VITE_STANDALONE_MODE: 'true',
  PORT: process.env.PORT || '5173'
};

// Run "vite" in the client directory
const viteProcess = spawn('vite', [], {
  cwd: clientDir,
  env,
  stdio: 'inherit',
  shell: true
});

// Handle process events
viteProcess.on('error', (err) => {
  console.error('Failed to start Vite server:', err);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  console.log(`Vite server exited with code ${code}`);
  process.exit(code);
});

// Add event handlers for termination signals
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\nReceived ${signal}, shutting down...`);
    viteProcess.kill(signal);
  });
});