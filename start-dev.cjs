#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Change to the project directory
const projectDir = path.resolve(__dirname);
process.chdir(projectDir);

// Create necessary directories and files if they don't exist
const setupProject = () => {
    // Create pages directory if it doesn't exist
    if (!fs.existsSync('pages')) {
        fs.mkdirSync('pages');
    }

    // Create _app.js if it doesn't exist
    const appContent = `
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
`;
    if (!fs.existsSync('pages/_app.js')) {
        fs.writeFileSync('pages/_app.js', appContent);
    }

    // Create index.js if it doesn't exist
    const indexContent = `
export default function Home() {
  return (
    <div>
      <h1>Welcome to DevDash</h1>
    </div>
  )
}
`;
    if (!fs.existsSync('pages/index.js')) {
        fs.writeFileSync('pages/index.js', indexContent);
    }

    // Create styles directory and globals.css
    if (!fs.existsSync('styles')) {
        fs.mkdirSync('styles');
    }
    if (!fs.existsSync('styles/globals.css')) {
        fs.writeFileSync('styles/globals.css', `
html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}
`);
    }
};

// Setup the project structure
setupProject();

// Create a shell script that PM2 can run
const shellScript = `
@echo off
cd "${projectDir.replace(/\\/g, '\\\\')}"
npm install && npm run dev
`;

// Write the shell script
fs.writeFileSync(path.join(projectDir, 'start-dev.cmd'), shellScript);

// Make it executable (not needed for Windows but good practice)
try {
    fs.chmodSync(path.join(projectDir, 'start-dev.cmd'), '755');
} catch (error) {
    // Ignore chmod errors on Windows
}

// Log the creation
console.log('Created necessary Next.js files and start-dev.cmd script');
console.log('You can now run: pm2 start start-dev.cmd --name DevDash');

// If this script is run directly, execute the command
if (require.main === module) {
    try {
        execSync('pm2 delete DevDash', { stdio: 'ignore' });
    } catch (error) {
        // Ignore errors if the process doesn't exist
    }
    execSync('pm2 start start-dev.cmd --name DevDash', { stdio: 'inherit' });
} 