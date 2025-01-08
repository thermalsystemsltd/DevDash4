const { spawn } = require('child_process');
const path = require('path');

// Ensure we're in the project directory
const projectDir = path.resolve(__dirname);
process.chdir(projectDir);

// Function to run a command and return a promise
function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            cwd: projectDir
        });

        process.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command failed with code ${code}`));
        });
    });
}

// Main async function to run commands in sequence
async function main() {
    try {
        // First run npm install
        await runCommand('npm', ['install']);
        
        // Then run npm run dev
        const devProcess = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            shell: true,
            cwd: projectDir
        });

        devProcess.on('exit', (code) => {
            console.log(`Dev process exited with code ${code}`);
            process.exit(code);
        });

        // Handle shutdown gracefully
        process.on('SIGTERM', () => {
            devProcess.kill();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Start the process
main(); 