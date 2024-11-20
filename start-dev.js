// start-dev.js
const { spawn } = require('child_process');

// Set environment variables for both server and worker
const env = { ...process.env, NODE_ENV: 'development' };

const server = spawn('nodemon', ['src/server.ts'], { stdio: 'inherit', env });
const worker = spawn('ts-node', ['src/worker.ts'], { stdio: 'inherit', env });

function handleExit(code) {
  server.kill('SIGINT');
  worker.kill('SIGINT');
  process.exit(code);
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('exit', handleExit);
