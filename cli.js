#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import figlet from 'figlet';
import { readFileSync } from 'fs';
import { access } from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const cl = console.log;
const cr = console.error;

// Chalk
const ckr = (msg) => chalk.red(`${msg}`);      // Error
const cky = (msg) => chalk.yellow(`${msg}`);   // Warning
const ckg = (msg) => chalk.green(`${msg}`);    // Success
const ckgr = (msg) => chalk.gray(`${msg}`);    // Info
const ckc = (msg) => chalk.cyan(`${msg}`);     // Highlight
const ckm = (msg) => chalk.magenta(`${msg}`);  // Action
const ckb = (msg) => chalk.blue(`${msg}`); // Blue

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Unified tech data structure
const techs = {
    "web": {
        name: "Web Technologies",
        items: {
            "angular": {
                description: "A platform for building mobile and desktop web applications",
                documentation: "https://angular.io/docs",
                script: "_tools/guis/web/angular/index.js"
            },
            "astro": {
                description: "Framework for building fast, content-focused websites",
                documentation: "https://docs.astro.build",
                script: "_tools/guis/web/astro/index.js"
            },
            "reactjs": {
                description: "A JavaScript library for building user interfaces",
                documentation: "https://react.dev/reference/react",
                script: "_tools/guis/web/reactjs/index.js"
            },
            "svelte": {
                description: "Cybernetically enhanced web apps with less code",
                documentation: "https://svelte.dev/docs",
                script: "_tools/guis/web/svelte/index.js"
            },
            "vuejs": {
                description: "Progressive JavaScript framework for building UIs",
                documentation: "https://vuejs.org/guide",
                script: "_tools/guis/web/vue/index.js"
            }
        }
    },
    "mobile": {
        name: "Mobile Technologies",
        items: {
            "flutter": {
                description: "UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase",
                documentation: "https://flutter.dev/docs",
                script: "_tools/guis/mobile/flutter/index.js"
            },
            "reactnative": {
                description: "Framework for building native apps using React",
                documentation: "https://reactnative.dev/docs/getting-started",
                script: "_tools/guis/mobile/reactnative/index.js"
            },
            "ionic": {
                description: "Open-source mobile UI toolkit for building high-quality, cross-platform apps",
                documentation: "https://ionicframework.com/docs",
                script: "_tools/guis/mobile/ionic/index.js"
            }
        }
    },
    "backend": {
        name: "Backend Technologies",
        items: {
            "apiplatform": {
                description: "REST and GraphQL framework to build API-driven projects",
                documentation: "https://api-platform.com/docs",
                script: "_tools/backends/apiplatform/index.js"
            },
            "expressjs": {
                description: "Fast, unopinionated, minimalist web framework for Node.js",
                documentation: "_tools/backends/expressjs/index.js"
            },
            "springboot": {
                description: "Java-based framework for building web applications and microservices",
                documentation: "https://spring.io/projects/spring-boot",
                script: "_tools/backends/springboot/index.js"
            }
        }
    },
    "database": {
        name: "Database Technologies",
        items: {
            "mariadb": {
                description: "Community-developed fork of MySQL relational database",
                documentation: "https://mariadb.org/documentation",
                script: "_tools/databases/mariadb/index.js"
            },
            "mongodb": {
                description: "NoSQL document database with scalability and flexibility",
                documentation: "https://docs.mongodb.com",
                script: "_tools/databases/mongodb/index.js"
            },
            "oracleenterprise": {
                description: "Enterprise-grade relational database management system",
                documentation: "https://docs.oracle.com/en/database",
                script: "_tools/databases/oracleenterprise/index.js"
            },
            "postgresql": {
                description: "Powerful, open source object-relational database system",
                documentation: "https://www.postgresql.org/docs",
                script: "_tools/databases/postgresql/index.js"
            }
        }
    }
};

// Helper function to find a technology and optionally restrict to a specific category
function findTechnology({ techName, categoryFilter = null }) {
    if (categoryFilter) {
        const categoryData = techs[categoryFilter];
        if (categoryData && categoryData.items[techName]) {
            return {
                name: techName,
                category: categoryFilter,
                ...categoryData.items[techName]
            };
        }
        return null; // Tech not found in the specified category
    }

    // Search in all categories if no category filter is provided
    for (const [category, categoryData] of Object.entries(techs)) {
        if (categoryData.items[techName]) {
            return {
                name: techName,
                category: category,
                ...categoryData.items[techName]
            };
        }
    }

    return null; // Tech not found
}


function validateProjectName({ projectName, minLength = 4 }) {
    if (!projectName) {
        cr(ckr("Invalid project name!\n"));
        process.exit(1);
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
        cr(ckr("Invalid project name! Only letters, numbers, dashes, and underscores are allowed.\n"));
        process.exit(1);
    }
    if (projectName.length < minLength) {
        cr(ckr(`Project name is too short! It must be at least ${minLength} characters.\n`));
        process.exit(1);
    }
}

// Read package version from package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// Initialize commander program
const program = new Command();

// Command definitions with descriptions and examples
const commands = {
    version: {
        description: 'Display the current version of the CLI tool',
        usage: `${packageData.name} version`,
        action: () => cl(`${packageData.name} version ${packageData.version}\n`)
    },
    help: {
        description: 'Display help information for all commands or a specific command',
        usage: `${packageData.name} help [command]`,
        action: (cmd) => showHelp(cmd)
    },
    list: {
        description: 'List all available technologies or filter by category',
        usage: `${packageData.name} list [category]`,
        action: (category) => listTechnologies(category)
    },
    info: {
        description: 'Show detailed information about a specific technology',
        usage: `${packageData.name} info <technology>`,
        action: (tech) => showTechInfo(tech)
    },
    create: {
        description: "Create a new project with a selected technology's category",
        usage: `${packageData.name}  create <project-name> --category <category> --technology <tech>`,
        action: (projectName, options) => createProject(projectName, options)
    }
};

// Display help for all commands or a specific command
function showHelp(command) {
    if (command && commands[command]) {
        cl(ckc(`\nCommand: ${command}`));
        cl(ckm(`Description: ${commands[command].description}`));
        cl(ckm(`Usage: ${commands[command].usage}`));
        cl('\n');
    } else if (command) {
        cl(ckr(`\nUnknown command: ${command}`));
        cl(cky('Available commands:'));
        Object.keys(commands).forEach(cmd => {
            cl(ckg(`  ${cmd}`) + ckm(` - ${commands[cmd].description}`));
        });
    } else {
        cl(ckc('\nAvailable commands:'));
        Object.keys(commands).forEach(cmd => {
            cl(ckg(`  ${cmd}`) + ckm(` - ${commands[cmd].description}`));
            cl(ckgr(`    Usage: ${commands[cmd].usage}`));
        });
        cl('\n');
    }
}

// List technologies
function listTechnologies(category) {
    if (category && techs[category]) {
        cl(ckc(`\nAvailable ${techs[category].name}:`));
        Object.keys(techs[category].items).forEach(tech => {
            cl(ckg(`  - ${tech}`));
        });
    } else if (category) {
        cr(ckr(`\nUnknown category: ${category}`));
        cl(cky('Available categories:'));
        Object.keys(techs).forEach(cat => {
            cl(ckg(`  ${cat}`));
        });
    } else {
        cl(ckc('\nAll available technologies:'));
        Object.keys(techs).forEach(category => {
            cl(cky(`\n${techs[category].name}:`));
            Object.keys(techs[category].items).forEach(tech => {
                cl(ckg(`  - ${tech}`));
            });
        });
    }
    cl('\n');
}

// Show detailed information about a technology
function showTechInfo(technology) {
    const techInfo = findTechnology({ techName: technology });

    if (techInfo) {
        cl(ckc(`\nInformation about ${technology}:`));
        cl(ckm(`Category: ${techs[techInfo.category].name}`));
        cl(ckm(`Description: ${techInfo.description}`));
        cl(ckm(`Documentation: ${techInfo.documentation}`));
    } else {
        cl(ckr(`\nUnknown technology: ${technology}`));
        cl(cky(`\nRun "${packageData.name} list" to see all available technologies.`));
    }
    cl('\n');
}


async function runScript({ scriptPath, projectName }) {
    try {
        cl(ckgr(`\nExecuting script...`));

        const module = await import(scriptPath);

        let executableFunction;

        if (module.default && typeof module.default === 'function') {
            executableFunction = module.default;
        } else if (module.run && typeof module.run === 'function') {
            // Fallback to a named "run" function if available
            executableFunction = module.run;
        } else {
            ce(ckr(`No executable function found in ${fullPath}`));
            process.exit(1);
        }

        await executableFunction(projectName);

        cl(ckg('\nScript executed successfully.'));

    } catch (error) {
        cr(`\nError executing script: ${scriptPath}`);
        cr(ckr(error));
        process.exit(1);
    }
}


// Create a project with a single technology category
async function createProject({ projectName, options }) {
    if (!projectName) {
        cl(ckr('\nPlease provide a project name.'));
        return;
    }

    validateProjectName({ projectName, minLength: 4 });

    const { category, technology } = options;
    const categories = Object.keys(techs);

    if (!category || !categories.includes(category)) {
        cl(ckr(`\nPlease specify a valid category (use the -c option): ${categories.join(', ')}\n`));
        return;
    }

    if (!technology) {
        cl(ckr(`\nPlease specify a technology (use the -t option) for the category "${category}"`));
        cl(cky(`\nAvailable ${category} technologies:`));
        Object.keys(techs[category].items).forEach(tech => cl(ckg(`  - ${tech}`)));
        return;
    }

    const techInfo = findTechnology({ techName: technology, categoryFilter: category });

    if (!techInfo) {
        cl(ckr(`\nUnknown technology "${technology}" in the category "${category}"`));
        cl(cky(`\nAvailable technologies in the category "${category}" :`));
        Object.keys(techs[category].items).forEach(tech => cl(ckg(`  - ${tech}`)));
        return;
    }

    cl(ckc(`\nCreating project "${projectName}" with ${category} technology:`));
    cl(ckg(`  ${category.charAt(0).toUpperCase() + category.slice(1)}: ${technology}`));

    if (techInfo.script) {
        const scriptPath = techInfo.script;

        try {
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const scriptPath = path.resolve(__dirname, techInfo.script);

            access(scriptPath);

            await runScript({ scriptPath, projectName });
        } catch (error) {
            cl(ckr(`\nScript not found at path: ${scriptPath}`));
            cr(ckr(error));
        }
    } else {
        cl(ckr('\nNo script defined for this technology.'));
    }

    cl('\n');
}


// Define and register commands
program
    .description('A CLI tool for managing web development technologies');

program
    .command('version')
    .description(commands.version.description)
    .action(commands.version.action);

program
    .command('help [command]')
    .description(commands.help.description)
    .action(commands.help.action);

program
    .command('list [category]')
    .description(commands.list.description)
    .action(commands.list.action);

program
    .command('info [technology]')
    .description(commands.info.description)
    .action(commands.info.action);

program
    .command('create [projectName]')
    .description("Create a new project with a selected technology's category")
    .option('-c, --category <category>', 'Technology category (web, backend, database)')
    .option('-t, --technology <tech>', 'Specific technology to use within the category')
    .action((projectName, options) => {
        if (!projectName) {
            cr(ckr('Project name is required.\n'));
            process.exit(1);
        }
        validateProjectName({ projectName, minLength: 4 })
        createProject({ projectName, options });
    });

// Handle unknown commands
program
    .on('command:*', () => {
        cr(ckr(`\nInvalid command: ${program.args.join(' ')}`));
        cl(cky('\nSee -h, --help for a list of available commands.\n'));
        process.exit(1);
    });

// CLI header
cl(ckb(figlet.textSync('TechCLI', { horizontalLayout: 'full' })));

// Parse command line arguments
program.parse(process.argv);

// If no arguments, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
