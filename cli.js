#!/usr/bin/env bun

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

console.log("🌟 Welcome to Multi-Techs Utility!");
console.log("This project helps generate projects for different technologies.\n");

// Define available web GUI technologies
const webTechs = ["angular", "astro", "reactjs", "svelte", "vuejs"];

// Define available BACKENDS technologies
const backendsTechs = ["apiplatform", "expressjs", "springboot"];

// Define available DATABASES technologies
const databasesTechs = ["mariadb", "mongodb", "oracleenterprise", "postgresql"];

// List of commands and their descriptions
const commandsList = [
    { name: "hello", description: `Prints "Hello, world!"` },
    { name: "version", description: `Displays the CLI version` },
    { name: "help", description: `Shows this help message` },
    ...webTechs.map((tech) => ({
        name: `guis:web:${tech} <name>`,
        description: `Creates a guis web project with the given name using ${tech} `
    })),
    ...backendsTechs.map((tech) => ({
        name: `backends:${tech} <name>`,
        description: `Creates a backend project with the given name using ${tech}`
    })),
    ...databasesTechs.map((tech) => ({
        name: `databases:${tech} <name>`,
        description: `Creates a database project (Docker) with the given name using ${tech}`
    }))
];

// Determine max length of command names for proper alignment
const maxCommandLength = Math.max(...commandsList.map(cmd => cmd.name.length));
const paddingSpace = 2; // Space between command and description

function formatCommand(name, description) {
    const padding = " ".repeat(maxCommandLength - name.length + paddingSpace);
    return `  ${name}${padding}${description}`;
}

const usage = `
Usage:
  multi-techs-utility <command> [options]

Commands:
${commandsList.map(cmd => formatCommand(cmd.name, cmd.description)).join("\n")}

Examples:
  multi-techs-utility hello
  multi-techs-utility version
${webTechs.map(tech => `  multi-techs-utility guis:web:${tech} my-${tech}-app`).join("\n")}
${backendsTechs.map(tech => `  multi-techs-utility backends:${tech} my-${tech}-app`).join("\n")}
${databasesTechs.map(tech => `  multi-techs-utility databases:${tech} my-${tech}-db`).join("\n")}
  multi-techs-utility help
`;

async function getVersion() {
    try {
        const packageJsonPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "package.json");
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        console.log(`📦 Multi-Techs Utility v${packageJson.version}`);
    } catch (error) {
        console.error("⚠️ Error reading version:", error.message);
    }
}

async function runScript(scriptPath, ...args) {
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const fullPath = path.resolve(__dirname, scriptPath);
        const module = await import(fullPath);

        if (module.default) {
            await module.default(...args);
        } else {
            console.error(`⚠️ No default export found in ${scriptPath}`);
        }
    } catch (error) {
        console.error(`⚠️ Error executing script: ${scriptPath}`);
        console.error(error.message);
    }
}

const commands = {
    hello: () => console.log("👋 Hello, world!"),
    version: getVersion,
    help: () => console.log(usage),
};

// Dynamically register web GUI commands
webTechs.forEach((tech) => {
    commands[`guis:web:${tech}`] = async (args) => {
        if (!args[0]) {
            console.error(`❌ Missing project name! Usage: multi-techs-utility guis:web:${tech} <name>`);
            process.exit(1);
        }
        await runScript(`_tools/guis/web/${tech}/index.js`, args[0]);
    };
});

// Dynamically register BACKENDS commands
backendsTechs.forEach((tech) => {
    commands[`backends:${tech}`] = async (args) => {
        if (!args[0]) {
            console.error(`❌ Missing project name! Usage: multi-techs-utility backends:${tech} <name>`);
            process.exit(1);
        }
        await runScript(`_tools/backends/${tech}/index.js`, args[0]);
    };
});

// Dynamically register BACKENDS commands
databasesTechs.forEach((tech) => {
    commands[`databases:${tech}`] = async (args) => {
        if (!args[0]) {
            console.error(`❌ Missing project name! Usage: multi-techs-utility databases:${tech} <name>`);
            process.exit(1);
        }
        await runScript(`_tools/databases/${tech}/index.js`, args[0]);
    };
});

async function main() {
    const args = process.argv.slice(2);
    if (args.length > 2) {
        console.error("❌ too much arguments");
        console.log(usage);
        process.exit(1);
    }

    const command = args[0];

    if (!command || !commands[command]) {
        console.error("❌ Unknown command:", command);
        console.log(usage);
        process.exit(1);
    }

    await commands[command](args.slice(1));
}

main();
