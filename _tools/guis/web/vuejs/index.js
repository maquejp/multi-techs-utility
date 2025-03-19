import { execSync } from "child_process";
import { cl, cr } from "../../../common/logging";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { createFolderStructureAndReadmes, getFormattedDate, sanitiseText } from "../../../common/common";

export default async function ({ projectName, parentProjectDir }) {

    try {
        cl(`\nCreating VueJs project: ${projectName}...`);
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
    cl(`\n1. Initialising VueJs project: ${projectName}...`);
    execSync(`bun create vue@latest ${projectName} --ts --router --pinia --eslint > /dev/null 2>&1`, {
        stdio: "inherit",
    });
    process.chdir(projectName);
    execSync("bun install --silent", { stdio: "inherit" });
    cl("   Done!");
}

function setupFramework({ projectName, parentProjectDir }) {
    cl(`\n2. Setting up VueJs project: ${projectName}...`);
    execSync("bun add --silent tailwindcss @tailwindcss/vite");
    const viteConfigPath = join(parentProjectDir, projectName, "vite.config.ts");
    let viteConfigContent = readFileSync(viteConfigPath, "utf-8");
    const lines = viteConfigContent.split("\n");
    const tailwindImportLine = "import tailwindcss from '@tailwindcss/vite'";
    const insertIndex = 2;
    lines.splice(insertIndex, 0, tailwindImportLine);
    viteConfigContent = lines.join("\n");
    viteConfigContent = viteConfigContent.replace(
        /plugins:\s*\[\s*([\s\S]*?)\s*\]/,
        "plugins: [\n    $1,\n    tailwindcss(),\n  ]"
    );
    if (!/server:\s*\{/.test(viteConfigContent)) {
        viteConfigContent = viteConfigContent.replace(
            /plugins:\s*\[.*?\]\s*,/s, // Match plugins array
            match => `${match}\n  server: {\n    port: 51733,\n  },`
        );
    }
    writeFileSync(viteConfigPath, viteConfigContent, "utf-8");
    cl("   Done!");
}

function createSuggestedFolderStructure({ projectName, parentProjectDir }) {
    cl(`\n3. Creating suggested folder structure`);
    const folders = [
        { name: "assets", readmeHeader: "# Static assets (images, fonts, styles)" },
        { name: "components", readmeHeader: "# Reusable components" },
        { name: "composables", readmeHeader: "# Reusable composable functions (Vue 3 hooks)" },
        { name: "layouts", readmeHeader: "# Layout components (Header, Sidebar, etc.)" },
        { name: "router", readmeHeader: "# Vue Router configuration" },
        { name: "stores", readmeHeader: "# Pinia/Vuex store modules" },
        { name: "styles", readmeHeader: "# Global styles (CSS, SCSS, Tailwind, etc.)" },
        { name: "utils", readmeHeader: "# Utility/helper functions" },
        { name: "views", readmeHeader: "# Page views (full-page components)" },
        { name: "services", readmeHeader: "# API calls, authentication, external services" },
        { name: "directives", readmeHeader: "# Custom Vue directives" },
        { name: "plugins", readmeHeader: "# Third-party plugin configuration (i18n, Axios, etc.)" },
        { name: "types", readmeHeader: "# TypeScript interfaces and types" }
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
    const baseCssPath = join(parentProjectDir, projectName, "src", "assets", "base.css");
    const updatedBaseCssContent = '@import "tailwindcss";\n';
    writeFileSync(baseCssPath, updatedBaseCssContent, "utf-8");
    const mainCssPath = join(parentProjectDir, projectName, "src", "assets", "main.css");
    const updatedMainCssContent = "@import './base.css';\n";
    writeFileSync(mainCssPath, updatedMainCssContent, "utf-8");
    const appVuePath = join(parentProjectDir, projectName, "src", "App.vue");
    const updatedAppVueContent = `<template><div><div class="h-1/3 w-full flex items-center justify-center"><h1 class="text-3xl font-bold underline">${formattedProjectName} with VueJs (vite)</h1></div><div><p class="mt-4 text-gray-500 text-3xl">${getFormattedDate()}</p></div></div></template>`;
    writeFileSync(appVuePath, updatedAppVueContent, "utf-8");
    cl(`   Done!`);
}