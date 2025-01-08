const { exec } = require('child_process');

const nextProcess = exec('npx next dev', {
    windowsHide: true,
    env: { ...process.env, FORCE_COLOR: '1' }
});

nextProcess.stdout.on('data', (data) => {
    console.log(data.toString());
});

nextProcess.stderr.on('data', (data) => {
    console.error(data.toString());
});

nextProcess.on('exit', (code) => {
    console.log(`Process exited with code ${code}`);
});

// Keep the process running
process.on('SIGTERM', () => {
    nextProcess.kill();
    process.exit(0);
});
