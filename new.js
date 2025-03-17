#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const cl = console.log;
const cr = console.error;
const ckr = chalk.red;
const cky = chalk.yellow;
const ckg = chalk.green;
const ckgr = chalk.gray;
const ckc = chalk.cyan;
const ckw = chalk.white;

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
                documentation: "https://angular.io/docs"
            },
            "astro": {
                description: "Framework for building fast, content-focused websites",
                documentation: "https://docs.astro.build"
            },
            "reactjs": {
                description: "A JavaScript library for building user interfaces",
                documentation: "https://reactjs.org/docs"
            },
            "svelte": {
                description: "Cybernetically enhanced web apps with less code",
                documentation: "https://svelte.dev/docs"
            },
            "vuejs": {
                description: "Progressive JavaScript framework for building UIs",
                documentation: "https://vuejs.org/guide"
            }
        }
    },
    "backend": {
        name: "Backend Technologies",
        items: {
            "apiplatform": {
                description: "REST and GraphQL framework to build API-driven projects",
                documentation: "https://api-platform.com/docs"
            },
            "expressjs": {
                description: "Fast, unopinionated, minimalist web framework for Node.js",
                documentation: "https://expressjs.com/en/guide"
            },
            "springboot": {
                description: "Java-based framework for building web applications and microservices",
                documentation: "https://spring.io/projects/spring-boot"
            }
        }
    },
    "database": {
        name: "Database Technologies",
        items: {
            "mariadb": {
                description: "Community-developed fork of MySQL relational database",
                documentation: "https://mariadb.org/documentation"
            },
            "mongodb": {
                description: "NoSQL document database with scalability and flexibility",
                documentation: "https://docs.mongodb.com"
            },
            "oracleenterprise": {
                description: "Enterprise-grade relational database management system",
                documentation: "https://docs.oracle.com/en/database"
            },
            "postgresql": {
                description: "Powerful, open source object-relational database system",
                documentation: "https://www.postgresql.org/docs"
            }
        }
    }
};

// Helper function to find a technology and its category
function findTechnology(techName) {
    for (const [category, categoryData] of Object.entries(techs)) {
        if (categoryData.items[techName]) {
            return {
                name: techName,
                category: category,
                ...categoryData.items[techName]
            };
        }
    }
    return null;
}

function validateProjectName({ projectName, minLength = 4 }) {
    if (!projectName) {
        cr("Invalid project name!");
        process.exit(1);
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
        cr("Invalid project name! Only letters, numbers, dashes, and underscores are allowed.");
        process.exit(1);
    }
    if (projectName.length < minLength) {
        cr(`Project name is too short! It must be at least ${minLength} characters.`);
        process.exit(1);
    }
}

// Read package version from package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageData.version;

// Initialize commander program
const program = new Command();

// Command definitions with descriptions and examples
const commands = {
    version: {
        description: 'Display the current version of the CLI tool',
        usage: 'techcli version',
        action: () => cl(`TechCLI version: ${version}`)
    },
    help: {
        description: 'Display help information for all commands or a specific command',
        usage: 'techcli help [command]',
        action: (cmd) => showHelp(cmd)
    },
    list: {
        description: 'List all available technologies or filter by category',
        usage: 'techcli list [category]',
        action: (category) => listTechnologies(category)
    },
    info: {
        description: 'Show detailed information about a specific technology',
        usage: 'techcli info <technology>',
        action: (tech) => showTechInfo(tech)
    },
    create: {
        description: 'Create a new project with a selected technology category',
        usage: 'techcli create <project-name> --category <category> --technology <tech>',
        action: (projectName, options) => createProject(projectName, options)
    }
};

// CLI header
cl(
    cky(
        figlet.textSync('TechCLI', { horizontalLayout: 'full' })
    )
);

// Display help for all commands or a specific command
function showHelp(command) {
    if (command && commands[command]) {
        cl(ckc(`\nCommand: ${command}`));
        cl(ckw(`Description: ${commands[command].description}`));
        cl(ckw(`Usage: ${commands[command].usage}`));
        cl('\n');
    } else if (command) {
        cl(ckr(`\nUnknown command: ${command}`));
        cl(cky('Available commands:'));
        Object.keys(commands).forEach(cmd => {
            cl(ckg(`  ${cmd}`) + ckw(` - ${commands[cmd].description}`));
        });
    } else {
        cl(ckc('\nAvailable commands:'));
        Object.keys(commands).forEach(cmd => {
            cl(ckg(`  ${cmd}`) + ckw(` - ${commands[cmd].description}`));
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
        cl(ckr(`\nUnknown category: ${category}`));
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
    const techInfo = findTechnology(technology);

    if (techInfo) {
        cl(ckc(`\nInformation about ${technology}:`));
        cl(ckw(`Category: ${techs[techInfo.category].name}`));
        cl(ckw(`Description: ${techInfo.description}`));
        cl(ckw(`Documentation: ${techInfo.documentation}`));
    } else {
        cl(ckr(`\nUnknown technology: ${technology}`));
        cl(cky('Run "techcli list" to see all available technologies.'));
    }
    cl('\n');
}

// Create a project with a single technology category
function createProject(projectName, options) {
    if (!projectName) {
        cl(ckr('\nPlease provide a project name.'));
        return;
    }

    validateProjectName({ projectName, minLength: 4 });

    const { category, technology } = options;

    const categories = Object.keys(techs);

    if (!category || categories.indexOf(category) === -1) {
        cl(ckr(`\nPlease specify a valid category (use the -c option): ${categories.join(', ')}`));
        return;
    }

    if (!technology) {
        cl(ckr(`\nPlease specify a technology (use the -t option) for ${category}`));
        cl(cky(`\nAvailable ${category} technologies:`));
        Object.keys(techs[category].items).forEach(tech => {
            cl(ckg(`  - ${tech}`));
        });
        return;
    }

    if (!techs[category].items[technology]) {
        cl(ckr(`\nInvalid ${category} technology: ${technology}`));
        cl(cky(`Available ${category} technologies:`));
        Object.keys(techs[category].items).forEach(tech => {
            cl(ckg(`  - ${tech}`));
        });
        return;
    }

    cl(ckc(`\nCreating project "${projectName}" with ${category} technology:`));
    cl(ckg(`  ${category.charAt(0).toUpperCase() + category.slice(1)}: ${technology}`));

    const scriptPath = `_tools/${category === "web/" ? "guis" : ""}${category}/${technology}/index.js`;
    cl(cky(`\nScript path: ${scriptPath}`));

    cl('\n');
}

// Define and register commands
program
    .version(version, '-v, --version', 'Output the current version')
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
    .command('info <technology>')
    .description(commands.info.description)
    .action(commands.info.action);

program
    .command('create [projectName]')
    .description('Create a new project with a selected technology category')
    .option('-c, --category <category>', 'Technology category (web, backend, database)')
    .option('-t, --technology <tech>', 'Specific technology to use within the category')
    .action((projectName, options) => {
        if (!projectName) {
            console.error(chalk.red('Error: Project name is required.'));
            process.exit(1);
        }
        validateProjectName({ projectName, minLength: 4 })
        createProject(projectName, options);
    });

// Handle unknown commands
program
    .on('command:*', () => {
        cr(ckr(`\nInvalid command: ${program.args.join(' ')}`));
        cl(cky('See --help for a list of available commands.'));
        process.exit(1);
    });

// Parse command line arguments
program.parse(process.argv);

// If no arguments, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}