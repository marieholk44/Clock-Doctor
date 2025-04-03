// This script checks for a STANDALONE env variable and runs the appropriate start script
import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Check for STANDALONE mode
const isStandalone = process.env.STANDALONE === 'true';

let startCommand = isStandalone 
  ? ['node', 'start-frontend.js'] 
  : ['tsx', 'server/index.ts'];

console.log(`Starting in ${isStandalone ? 'STANDALONE' : 'SERVER'} mode...`);

const childProcess = spawn(startCommand[0], startCommand.slice(1), {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

childProcess.on('error', (err) => {
  console.error(`Failed to start process: ${err}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  childProcess.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  childProcess.kill('SIGTERM');
  process.exit();
});