const { exec } = require('child_process');

const process = exec('next dev', {
    windowsHide: true,
    env: { ...process.env, FORCE_COLOR: '1' }
});

process.stdout.on('data', (data) => {
    console.log(data);
});

process.stderr.on('data', (data) => {
    console.error(data);
});

process.on('exit', (code) => {
    console.log(`Process exited with code ${code}`);
}); 