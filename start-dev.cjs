#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Change to the project directory
const projectDir = path.resolve(__dirname);
process.chdir(projectDir);

// Create ecosystem config file
const ecosystemConfig = `
module.exports = {
  apps: [{
    name: 'DevDash',
    script: 'npm',
    args: 'run dev',
    cwd: '${projectDir.replace(/\\/g, '\\\\')}',
    env: {
      NODE_ENV: 'development'
    },
    watch: false
  }]
};
`;

// Write ecosystem config
fs.writeFileSync('ecosystem.config.js', ecosystemConfig);

// Function to run a command
function runCommand(command) {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Failed to execute: ${command}`);
        throw error;
    }
}

try {
    // Clean up existing processes
    try {
        runCommand('pm2 delete DevDash');
    } catch (error) {
        // Ignore errors if process doesn't exist
    }

    // Clean up existing files
    if (fs.existsSync('.next')) {
        fs.rmSync('.next', { recursive: true, force: true });
    }
    if (fs.existsSync('node_modules')) {
        fs.rmSync('node_modules', { recursive: true, force: true });
    }

    // Install dependencies
    console.log('Installing dependencies...');
    runCommand('npm install');

    // Start with PM2
    console.log('Starting PM2...');
    runCommand('pm2 start ecosystem.config.js');
    runCommand('pm2 save');

    console.log('Application started successfully!');
    console.log('You can view logs using: pm2 logs DevDash');

} catch (error) {
    console.error('Error:', error);
    process.exit(1);
} 