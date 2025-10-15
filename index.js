#!/usr/bin/env node

import { Command } from "commander"
import inquirer from "inquirer"
import chalk from "chalk"
import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Rainbow helper function
function rainbow(text) {
  const colors = [chalk.red, chalk.yellow, chalk.green, chalk.cyan, chalk.blue, chalk.magenta]
  return text.split('').map((char, i) => {
    // Don't colorize spaces, newlines, or emojis
    if (char === ' ' || char === '\n' || char === '\t') return char
    return colors[i % colors.length](char)
  }).join('')
}

// Create project folders
async function createProjectStructure(projectPath, answers) {
  const spinner = ora('Creating project structure...').start()
  
  try {
    // Use async versions
    await fs.ensureDir(projectPath)
    await fs.ensureDir(path.join(projectPath, 'src'))
    await fs.ensureDir(path.join(projectPath, 'src/components'))
    await fs.ensureDir(path.join(projectPath, 'src/assets'))
    await fs.ensureDir(path.join(projectPath, 'src/styles'))
    await fs.ensureDir(path.join(projectPath, 'public'))
    
    if (answers.useRouter) {
      await fs.ensureDir(path.join(projectPath, 'src/pages'))
    }
    
    spinner.succeed('Project structure created')
  } catch (error) {
    spinner.fail('Failed to create project structure')
    throw error
  }
}

// Function to create package.json
async function createPackageJson(projectPath, answers) {
  const spinner = ora('Creating package.json...').start()
  
  try {
    const dependencies = {
      "react": "^18.3.1",
      "react-dom": "^18.3.1"
    }
    
    if (answers.useRouter) {
      dependencies["react-router-dom"] = "^6.26.0"
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
    }
    
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )
    
    spinner.succeed('package.json created')
  } catch (error) {
    spinner.fail('Failed to create package.json')
    throw error
  }
}

// Function to create config files
async function createConfigFiles(projectPath) {
  const spinner = ora('Creating configuration files...').start()
  
  try {
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`

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
`

    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`

    const gitignore = `node_modules
dist
dist-ssr
*.local
.DS_Store
`

    // Write all files with Promise.all for speed
    await Promise.all([
      fs.writeFile(path.join(projectPath, 'vite.config.js'), viteConfig),
      fs.writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfig),
      fs.writeFile(path.join(projectPath, 'postcss.config.js'), postcssConfig),
      fs.writeFile(path.join(projectPath, '.gitignore'), gitignore)
    ])
    
    spinner.succeed('Configuration files created')
  } catch (error) {
    spinner.fail('Failed to create configuration files')
    throw error
  }
}

// Function to create React source files
async function createSourceFiles(projectPath, answers) {
  const spinner = ora('Creating source files...').start()
  
  try {
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
`

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
`

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
`

    const indexCss = `@tailwind base
@tailwind components
@tailwind utilities
`

    await Promise.all([
      fs.writeFile(path.join(projectPath, 'index.html'), indexHtml),
      fs.writeFile(path.join(projectPath, 'src/main.jsx'), mainJsx),
      fs.writeFile(path.join(projectPath, 'src/App.jsx'), appJsx),
      fs.writeFile(path.join(projectPath, 'src/styles/index.css'), indexCss)
    ])
    
    spinner.succeed('Source files created')
  } catch (error) {
    spinner.fail('Failed to create source files')
    throw error
  }
}

// npm install
async function installDependencies(projectPath) {
  const spinner = ora({
    text: `${chalk.bold.italic.magenta('Installing dependencies (this may take a minute)...')}`,
    spinner: 'pong',  // Use a simpler spinner
    color: 'magenta'
}).start()
  
  try {
    await execAsync('npm install', {
      cwd: projectPath
    })
    spinner.succeed('Dependencies installed')
  } catch (error) {
    spinner.fail('Failed to install dependencies')
    throw error
  }
}

async function initializeGit(projectPath) {
  const spinner = ora('Initializing git repository...').start()
  
  try {
    await execAsync('git init', { cwd: projectPath })
    await execAsync('git add .', { cwd: projectPath })
    await execAsync('git commit -m "Initial commit from create-joji-app"', { cwd: projectPath })
    spinner.succeed('Git repository initialized')
  } catch (error) {
    spinner.warn('Could not initialize git (this is okay!)')
  }
}

const program = new Command()

program
  .name('create-joji-app')
  .description('Scaffold a React + Vite + Tailwind project')
  .version('1.0.0')
  .argument('[project-name]', 'Name of your project')
  .action(async (projectName) => {
    console.log(chalk.bold.italic(rainbow('Welcome to Joji App Creator!')))

    // First, ask for location
    const locationAnswer = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectLocation',
            message: 'Where should we create this project?',
            default: 'C:/Users/JojoW/Documents/Coding',
            validate: (input) => {
                const normalizedPath = input.replace(/\\/g, '/')
                if (fs.existsSync(normalizedPath)) return true
                return 'That directory does not exist. Please enter a valid path.'
            }
        }
    ])

    const normalizedLocation = locationAnswer.projectLocation.replace(/\\/g, '/')

    // Loop until we get a valid project name
    let projectNameAnswer
    let projectPath
    let nameIsValid = false

    while (!nameIsValid) {
        projectNameAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'What is your project name?',
                default: projectName || 'my-react-app',
                validate: (input) => {
                    if (/^[a-z0-9-_]+$/.test(input)) return true
                    return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores'
                }
            }
        ])

        projectPath = path.join(normalizedLocation, projectNameAnswer.projectName)

        // Check if folder already exists
        if (fs.existsSync(projectPath)) {
            console.log(chalk.red(`\n❌ Directory "${projectNameAnswer.projectName}" already exists! Please choose another name.\n`))
        } else {
            nameIsValid = true
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
    ])

    // Combine all answers
    const answers = {
        projectLocation: locationAnswer.projectLocation,
        projectName: projectNameAnswer.projectName,
        ...otherAnswers
    }

    // Now continue with your existing code
    // Now continue with your existing code
await createProjectStructure(projectPath, answers)
await createPackageJson(projectPath, answers)
await createConfigFiles(projectPath)
await createSourceFiles(projectPath, answers)

if (answers.installNow) {
    await installDependencies(projectPath)
}

await initializeGit(projectPath)

    console.log(chalk.green.bold('\n✨ Success! Your project is ready!\n'))
    console.log(chalk.cyan('To get started:\n'))
    console.log(chalk.white(`  cd ${answers.projectName}`))
    if (!answers.installNow) {
        console.log(chalk.white('  npm install'))
    }
    console.log(chalk.white('  npm run dev\n'))
    console.log(chalk.bold.italic(rainbow('Happy coding!!!')))
})

program.parse()