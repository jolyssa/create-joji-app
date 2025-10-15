#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { execSync } from 'child_process';

// Create project folders
function createProjectStructure(projectPath, answers) {
const spinner = ora({
    text: 'Creating project structure...',
    spinner: 'dots'  // Use a simpler spinner
}).start();

  try {
    // Create main directories
    fs.ensureDirSync(projectPath);
    fs.ensureDirSync(path.join(projectPath, 'src'))
    fs.ensureDirSync(path.join(projectPath, 'src/components'));
    fs.ensureDirSync(path.join(projectPath, 'src/assets'))
    fs.ensureDirSync(path.join(projectPath, 'src/styles'))
    fs.ensureDirSync(path.join(projectPath, 'public'))

    if (answers.useRouter) {
      fs.ensureDirSync(path.join(projectPath, 'src/pages'))
    }

    spinner.succeed('Project structure created')
  } catch (error) {
    spinner.fail('Failed to create project structure')
    throw error
  }
}

// Function to create package.json
function createPackageJson(projectPath, answers) {
  const spinner = ora('Creating package.json...').start();

  try {
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

    spinner.succeed('package.json created');
  } catch (error) {
    spinner.fail('Failed to create package.json');
    throw error;
  }
}

// Function to create config files
function createConfigFiles(projectPath) {
  const spinner = ora('Creating configuration files...').start();

  try {
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

    spinner.succeed('Configuration files created');
  } catch (error) {
    spinner.fail('Failed to create configuration files');
    throw error;
  }
}

// Function to create React source files
function createSourceFiles(projectPath, answers) {
  const spinner = ora('Creating source files...').start();

  try {
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

    // App.jsx
    const appJsx = `function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ${answers.projectName}
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to your new React + Vite + Tailwind project!🚀
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

    // index.css
    const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

    // Write all source files
    fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtml);
    fs.writeFileSync(path.join(projectPath, 'src/main.jsx'), mainJsx);
    fs.writeFileSync(path.join(projectPath, 'src/App.jsx'), appJsx);
    fs.writeFileSync(path.join(projectPath, 'src/styles/index.css'), indexCss);

    spinner.succeed('Source files created');
  } catch (error) {
    spinner.fail('Failed to create source files');
    throw error;
  }
}

// npm install
function installDependencies(projectPath) {
  const spinner = ora({
    text: 'Installing dependencies (this may take a minute)...',
    spinner: 'dots',
  }).start();

  try {
    execSync('npm install', {
      cwd: projectPath,
      stdio: 'ignore'  // Don't show npm's output
    });
    spinner.succeed('Dependencies installed');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    throw error;
  }
}

function initializeGit(projectPath) {
  const spinner = ora('Initializing git repository...').start();

  try {
    execSync('git init', { cwd: projectPath, stdio: 'ignore' });
    execSync('git add .', { cwd: projectPath, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from create-joji-app"', {
      cwd: projectPath,
      stdio: 'ignore'
    });
    spinner.succeed('Git repository initialized');
  } catch (error) {
    spinner.warn('Could not initialize git (this is okay!)');
  }
}

const program = new Command()

program
  .name('create-joji-app')
  .description('Scaffold a React + Vite + Tailwind project')
  .version('1.0.0')
  .argument('[project-name]', 'Name of your project')
  .action(async (projectName) => {
    console.log(chalk.cyan.bold('\n🚀 Welcome to Joji App Creator!\n'))

    // First, ask for location
    const locationAnswer = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectLocation',
            message: 'Where should we create this project?',
            default: 'C:/Users/JojoW/Documents/Coding',
            validate: (input) => {
                const normalizedPath = input.replace(/\\/g, '/');
                if (fs.existsSync(normalizedPath)) return true;
                return 'That directory does not exist. Please enter a valid path.'
            }
        }
    ]);

    const normalizedLocation = locationAnswer.projectLocation.replace(/\\/g, '/');

    // Loop until we get a valid project name
    let projectNameAnswer;
    let projectPath;
    let nameIsValid = false;

    while (!nameIsValid) {
        projectNameAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'What is your project name?',
                default: projectName || 'my-react-app',
                validate: (input) => {
                    if (/^[a-z0-9-_]+$/.test(input)) return true;
                    return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores'
                }
            }
        ]);

        projectPath = path.join(normalizedLocation, projectNameAnswer.projectName);

        // Check if folder already exists
        if (fs.existsSync(projectPath)) {
            console.log(chalk.red(`\n❌ Directory "${projectNameAnswer.projectName}" already exists! Please choose another name.\n`));
        } else {
            nameIsValid = true;
        }
    }

    // Now ask the rest of the questions
    const otherAnswers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'useRouter',
            message: 'Include React Router?',
            default: true
        },
        {
            type: 'confirm',
            name: 'installNow',
            message: 'Install dependencies now?',
            default: true
        }
    ]);

    // Combine all answers
    const answers = {
        projectLocation: locationAnswer.projectLocation,
        projectName: projectNameAnswer.projectName,
        ...otherAnswers
    };

    // Now continue with your existing code
    createProjectStructure(projectPath, answers);
    createPackageJson(projectPath, answers);
    createConfigFiles(projectPath);
    createSourceFiles(projectPath, answers);

    if (answers.installNow) {
        installDependencies(projectPath);
    }

    initializeGit(projectPath);

    console.log(chalk.green.bold('\n✨ Success! Your project is ready!\n'));
    console.log(chalk.cyan('To get started:\n'));
    console.log(chalk.white(`  cd ${answers.projectName}`));
    if (!answers.installNow) {
        console.log(chalk.white('  npm install'));
    }
    console.log(chalk.white('  npm run dev\n'));
    console.log(chalk.gray('Happy coding! 🚀\n'));
})

program.parse()