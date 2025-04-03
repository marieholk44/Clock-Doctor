// Start the frontend only mode
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Set environment variables
process.env.STANDALONE = 'true';

// Start the Vite server directly
const viteProcess = spawn('npx', ['vite', '--config', 'client/vite.config.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    STANDALONE: 'true'
  }
});

console.log('Starting frontend in standalone mode...');

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite process:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  viteProcess.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  viteProcess.kill('SIGTERM');
  process.exit();
});