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
      NODE_ENV: 'development',
      PORT: 3000
    },
    watch: false,
    interpreter: 'node'
  }]
};
`;

// Write ecosystem config with .cjs extension
fs.writeFileSync('ecosystem.config.cjs', ecosystemConfig);

// Function to run a command
function runCommand(command, ignoreError = false) {
    try {
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        if (!ignoreError) {
            console.error(`Failed to execute: ${command}`);
            throw error;
        }
        return false;
    }
}

try {
    // Only delete the DevDash process if it exists
    runCommand('pm2 delete DevDash', true);

    // Clean up existing files
    console.log('Cleaning up existing files...');
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
    runCommand('pm2 start ecosystem.config.cjs');
    
    // Wait a moment for the process to start
    setTimeout(() => {
        // Save PM2 configuration
        runCommand('pm2 save', true);
        
        // Show status
        console.log('\nPM2 Status:');
        runCommand('pm2 list');
        
        console.log('\nApplication started successfully!');
        console.log('You can view logs using: pm2 logs DevDash');
        console.log('To restart the app use: pm2 restart DevDash');
        console.log('To stop the app use: pm2 stop DevDash');
    }, 2000);

} catch (error) {
    console.error('Error:', error);
    process.exit(1);
} 