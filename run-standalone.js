// Simple script to run the standalone frontend version
console.log("Starting ClockTick Analyzer in frontend-only mode...");
console.log("This will run using local browser storage only, with no backend requirements.");

import('child_process').then(({ spawn }) => {
  console.log("Launching application in standalone mode...");
  
  const child = spawn('node', ['start-standalone.js'], { 
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      STANDALONE: 'true'
    }
  });
  
  child.on('error', (err) => {
    console.error('Failed to start the application:', err);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    child.kill('SIGINT');
    process.exit();
  });
  
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    process.exit();
  });
}).catch(err => {
  console.error("Error importing child_process:", err);
});