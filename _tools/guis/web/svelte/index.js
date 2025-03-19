import { execSync } from "child_process";
import { cl, cr } from "../../../common/logging";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { createFolderStructureAndReadmes, getFormattedDate, sanitiseText } from "../../../common/common";

export default async function ({ projectName, parentProjectDir }) {

    try {
        cl(`\nCreating Svelte project: ${projectName}...`);
        cl(`   The project is about to be created in this location ${parentProjectDir}`);
        initialiseFramework({ projectName });
        setupFramework({ projectName, parentProjectDir });
        createSuggestedFolderStructure({ projectName, parentProjectDir });
        prepareBaseProject({ projectName, parentProjectDir });
        cl(`\n\nProject setup completed and ready at ${join(parentProjectDir, projectName)}`);
        cl("Happy coding!");
        cl("\n\nRun the following command to start the development server:");
        cl(`cd ${projectName}`);
        cl("bun run dev");
    } catch (error) {
        cr(error);
    }
}

function initialiseFramework({ projectName }) {
    cl(`\n1. Initialising Svelte project: ${projectName}...`);
    execSync(`bun create vite@latest ${projectName} --template svelte-ts > /dev/null 2>&1`, {
        stdio: "inherit",
    });
    process.chdir(projectName);
    execSync("bun install --silent", { stdio: "inherit" });
    cl("   Done!");
}

function setupFramework({ projectName, parentProjectDir }) {
    cl(`\n2. Setting up Svelte project: ${projectName}...`);
    execSync("bun add --silent tailwindcss @tailwindcss/vite");
    const viteConfigPath = join(parentProjectDir, projectName, "vite.config.ts");
    let viteConfigContent = readFileSync(viteConfigPath, "utf-8");
    const lines = viteConfigContent.split("\n");
    const tailwindImportLine = "import tailwindcss from '@tailwindcss/vite'";
    const insertIndex = 2;
    lines.splice(insertIndex, 0, tailwindImportLine);
    viteConfigContent = lines.join("\n");
    viteConfigContent = viteConfigContent.replace(
        /plugins:\s*\[\s*svelte\(\)\s*\]/,
        "plugins: [svelte(), tailwindcss()]"
    );
    if (!/server:\s*\{/.test(viteConfigContent)) {
        viteConfigContent = viteConfigContent.replace(
            /plugins:\s*\[.*?\]\s*,/s, // Match plugins array
            match => `${match}\n  server: {\n    port: 51732,\n  },`
        );
    }
    writeFileSync(viteConfigPath, viteConfigContent, "utf-8");
    cl("   Done!");
}

function createSuggestedFolderStructure({ projectName, parentProjectDir }) {
    cl(`\n3. Creating suggested folder structure`);
    const folders = [
        { name: "assets", readmeHeader: "# Static assets (images, fonts, styles)" },
        { name: "lib", readmeHeader: "# Library for reusable components, stores, and utilities" },
        { name: "lib/components", readmeHeader: "# Reusable UI components" },
        { name: "lib/stores", readmeHeader: "# Svelte stores (global state management)" },
        { name: "lib/utils", readmeHeader: "# Utility functions and helpers" },
        { name: "lib/hooks", readmeHeader: "# Custom Svelte hooks" },
        { name: "routes", readmeHeader: "# SvelteKit routes (if applicable)" },
        { name: "styles", readmeHeader: "# Global styles (CSS, SCSS, Tailwind, etc.)" },
        { name: "config", readmeHeader: "# Configuration files (API endpoints, constants)" },
        { name: "static", readmeHeader: "# Public static files (favicons, robots.txt, etc.)" },
        { name: "tests", readmeHeader: "# Unit and integration tests" }
    ];
    cl("\n   " + folders.map(f => f.name).join(", "));
    createFolderStructureAndReadmes({ basePath: join(parentProjectDir, projectName) + "/src", folders, withReadmes: true });
    cl("\n   Done!");
}

function prepareBaseProject({ projectName, parentProjectDir }) {
    cl(`\n4. Preparing the base project`);
    const formattedProjectName = sanitiseText({ text: projectName, capitalize: true });
    const indexHtmlPath = join(parentProjectDir, projectName, "index.html");
    const indexHtmlContent = readFileSync(indexHtmlPath, "utf-8");
    const updatedIndexHtmlContent = indexHtmlContent.replace(
        /<title>.*<\/title>/,
        `<title>${formattedProjectName}</title>`
    );
    writeFileSync(indexHtmlPath, updatedIndexHtmlContent, "utf-8");
    const appCssPath = join(parentProjectDir, projectName, "src", "app.css");
    const updatedAppCssContent = '@import "tailwindcss";\n';
    writeFileSync(appCssPath, updatedAppCssContent, "utf-8");
    const appSveltePath = join(parentProjectDir, projectName, "src", "App.svelte");
    const updatedAppSvelteContent = `<div><div class="h-1/3 w-full flex items-center justify-center"><h1 class="text-3xl font-bold underline">${formattedProjectName} with svelte (vite)</h1></div><div><p class="mt-4 text-gray-500 text-3xl">${getFormattedDate()}</p></div></div>`;
    writeFileSync(appSveltePath, updatedAppSvelteContent, "utf-8");
    cl(`   Done!`);
}