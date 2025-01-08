#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Change to the project directory
const projectDir = path.resolve(__dirname);
process.chdir(projectDir);

// Create necessary directories and files if they don't exist
const setupProject = () => {
    // Create app directory (Next.js 13+ app directory)
    if (!fs.existsSync('app')) {
        fs.mkdirSync('app');
    }

    // Create next.config.js
    const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
`;
    if (!fs.existsSync('next.config.js')) {
        fs.writeFileSync('next.config.js', nextConfigContent);
    }

    // Create app/layout.tsx
    const layoutContent = `
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;
    if (!fs.existsSync('app/layout.tsx')) {
        fs.writeFileSync('app/layout.tsx', layoutContent);
    }

    // Create app/page.tsx
    const pageContent = `
export default function Home() {
  return (
    <div>
      <h1>Welcome to DevDash</h1>
    </div>
  )
}
`;
    if (!fs.existsSync('app/page.tsx')) {
        fs.writeFileSync('app/page.tsx', pageContent);
    }
};

// Setup the project structure
setupProject();

// Create a shell script that PM2 can run
const installScript = `
@echo off
cd "${projectDir.replace(/\\/g, '\\\\')}"
call npm install next@latest react@latest react-dom@latest
call npm install --save-dev typescript @types/react @types/node @types/react-dom
call npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git --force
call npm run dev
`;

// Write the shell script
fs.writeFileSync(path.join(projectDir, 'start-dev.cmd'), installScript);

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