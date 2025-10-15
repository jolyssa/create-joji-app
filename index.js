#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import fs from 'fs-extra';
import path from 'path';

// Create project folders
function createProjectStructure(projectPath, answers) {
    console.log(chalk.blue('📁 Creating folders...'))

    // Create main directories
    fs.ensureDirSync(projectPath);
    fs.ensureDirSync(path.join(projectPath, 'src'));
    fs.ensureDirSync(path.join(projectPath, 'src/components'));
    fs.ensureDirSync(path.join(projectPath, 'src/assets'));
    fs.ensureDirSync(path.join(projectPath, 'src/styles'));
    fs.ensureDirSync(path.join(projectPath, 'public'));

    if (answers.useRouter) {
        fs.ensureDirSync(path.join(projectPath, 'src/pages'));
    }

    console.log(chalk.green('✓ Folders created!'));
}

// Function to create package.json
function createPackageJson(projectPath, answers) {
  console.log(chalk.blue('📦 Creating package.json...'));
  
  const dependencies = {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  };
  
  if (answers.useRouter) {
    dependencies["react-router-dom"] = "^6.26.0";
  }
  
  const packageJson = {
    name: answers.projectName,
    private: true,
    version: "0.1.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies,
    devDependencies: {
      "@vitejs/plugin-react": "^4.3.1",
      "autoprefixer": "^10.4.20",
      "postcss": "^8.4.41",
      "tailwindcss": "^3.4.10",
      "vite": "^5.4.1"
    }
  };
  
  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  console.log(chalk.green('✓ package.json created!'));
}

// Function to create config files
function createConfigFiles(projectPath) {
  console.log(chalk.blue('⚙️  Creating config files...'));
  
  // Vite config
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`;

  // Tailwind config
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

  // PostCSS config
  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

  // .gitignore
  const gitignore = `node_modules
dist
dist-ssr
*.local
.DS_Store
`;

  // Write all the files
  fs.writeFileSync(path.join(projectPath, 'vite.config.js'), viteConfig);
  fs.writeFileSync(path.join(projectPath, 'tailwind.config.js'), tailwindConfig);
  fs.writeFileSync(path.join(projectPath, 'postcss.config.js'), postcssConfig);
  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);
  
  console.log(chalk.green('✓ Config files created!'));
}

// Function to create React source files
function createSourceFiles(projectPath, answers) {
  console.log(chalk.blue('📝 Creating source files...'));
  
  // index.html
  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${answers.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

  // main.jsx
  const mainJsx = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
${answers.useRouter ? "import { BrowserRouter } from 'react-router-dom'" : ''}
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    ${answers.useRouter ? '<BrowserRouter>\n      <App />\n    </BrowserRouter>' : '<App />'}
  </StrictMode>,
)
`;

  // App.jsx (simple version without router for now)
  const appJsx = `function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ${answers.projectName}
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to your new React + Vite + Tailwind project! 🚀
        </p>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
          Get Started
        </button>
      </div>
    </div>
  )
}

export default App
`;

  // index.css (Tailwind imports)
  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

  // Write all source files
  fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtml);
  fs.writeFileSync(path.join(projectPath, 'src/main.jsx'), mainJsx);
  fs.writeFileSync(path.join(projectPath, 'src/App.jsx'), appJsx);
  fs.writeFileSync(path.join(projectPath, 'src/styles/index.css'), indexCss);
  
  console.log(chalk.green('✓ Source files created!'));
}

const program = new Command()

program
    .name('create-joji-app')
    .description('Scaffold a React + Vite + Tailwind project')
    .version('1.0.0')
    .argument('[project-name]', 'Name of your project')
    .action(async (projectName) => {
        console.log(chalk.cyan.bold('\n🚀 Welcome to Joji App Creator!\n'))

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'What is your project name?',
                default: projectName || 'my-react-app',
                validate: (input) => {
                    if (/^[a-z0-9-_]+$/.test(input)) return true;
                    return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores'
                }
            },
            {
                type: 'input',
                name: 'projectPath',
                message: 'Where should we create this project?',
                default: '/c/Users/JojoW/Documents/Coding'
            },
            {
                type: 'confirm',
                name: 'useRouter',
                message: 'Include React Router?',
                default: true
            }
        ])

        // Create project path
        const projectPath = path.join(process.cwd(), answers.projectName)

        // Does folder exist? Check
        if (fs.existsSync(projectPath)) {
            console.log(chalk.red(`\n❌ Directory "${answers.projectName}" already exists, please try something new.`))
            return
        }
        //  Create the folders
        createProjectStructure(projectPath, answers)
        createPackageJson(projectPath, answers)
        createConfigFiles(projectPath)
        createSourceFiles(projectPath, answers)

        console.log(chalk.green.bold('\n✨ Project created successfully!\n'));
    })



program.parse()