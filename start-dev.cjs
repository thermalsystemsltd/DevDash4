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

    // Create tsconfig.json if it doesn't exist
    const tsconfigContent = `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
    if (!fs.existsSync('tsconfig.json')) {
        fs.writeFileSync('tsconfig.json', tsconfigContent);
    }

    // Update package.json dependencies
    const packageJsonPath = path.join(projectDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.dependencies = {
            ...packageJson.dependencies,
            "next": "^14.0.0",
            "react": "^18.2.0",
            "react-dom": "^18.2.0"
        };
        packageJson.devDependencies = {
            ...packageJson.devDependencies,
            "@types/node": "^20.0.0",
            "@types/react": "^18.2.0",
            "@types/react-dom": "^18.2.0",
            "typescript": "^5.0.0"
        };
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
};

// Setup the project structure
setupProject();

// Create a shell script that PM2 can run
const shellScript = `
@echo off
cd "${projectDir.replace(/\\/g, '\\\\')}"
call npm install
call npm run dev
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