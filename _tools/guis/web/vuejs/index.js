import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { assemblePath, createFolderStructureAndReadmes, getFormattedDate, sanitiseText, validateProjectName } from "../../../common/common";

export default async function (projectName) {
    validateProjectName(projectName);

    const paths = await assemblePath({ projectName, projectRoot: "__GEN_PROJECTS", rootPath: "guis/web", tech: "vuejs" });

    console.log(`🚀 Creating VueJs project: ${projectName}...`);

    try {
        initialiseFramework({ projectName, techDir: paths.techDir, projectDir: paths.projectDir });

        setupFramework({ projectName, projectDir: paths.projectDir });

        createSuggestedFolderStructure({ projectDir: paths.projectDir });

        customiseBaseProject({ projectDir: paths.projectDir, formattedProjectName: sanitiseText({ text: projectName, capitalize: true }) });

        console.log(`✅ Project setup completed and ready at ${paths.projectDir}`);
        console.log("🚀 Happy coding!");

        console.log("ⓘ Run the following command to start the development server:");
        console.log(`ⓘ cd ./${paths.relativeProjectDir}`);
        console.log("ⓘ bun run dev");

        console.log("🚀 Starting the development server...");
        execSync("bun run dev", { stdio: "inherit" });

    } catch (error) {
        console.error(error);
    }
};


function initialiseFramework({ projectName, techDir, projectDir }) {
    console.log(`🚀 Initialising VueJs project: ${projectName}...`);

    console.log(`🔧 Changing working directory to ${techDir}`);
    process.chdir(techDir);

    console.log(`🔧 Creating VueJs project ${projectName}`);
    execSync(`bun create vue@latest ${projectName} --ts --router --pinia --eslint`, {
        stdio: "inherit",
    });

    console.log(`🔧 Changing working directory to ${projectDir}`);
    process.chdir(projectDir);

    console.log(`🔧 Installing dependencies`);
    execSync("bun install", { stdio: "inherit" });

    console.log("✅ Initialisation of VueJs project completed");

}

function setupFramework({ projectName, projectDir }) {
    console.log(`🚀 Setting up VueJs project: ${projectName}...`);

    console.log(`🔧 Changing working directory to ${projectDir}`);
    process.chdir(projectDir);

    console.log(`🔧 Adding Tailwind CSS for ${projectName}`);
    execSync("bun add tailwindcss @tailwindcss/vite");

    const viteConfigPath = path.join(projectDir, "vite.config.ts");
    console.log("ⓘ viteConfigPath: ", viteConfigPath);

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

    console.log("🔧 Adding server configuration...");
    if (!/server:\s*\{/.test(viteConfigContent)) {
        viteConfigContent = viteConfigContent.replace(
            /plugins:\s*\[.*?\]\s*,/s, // Match plugins array
            match => `${match}\n  server: {\n    port: 51733,\n  },`
        );
    }

    writeFileSync(viteConfigPath, viteConfigContent, "utf-8");
    console.log("✅ Tailwind CSS has been added to vite.config.ts");

    console.log("✅ Setting up VueJs project completed");

}

function createSuggestedFolderStructure({ projectDir }) {
    console.log(`🔧 Creating suggested folder structure`);

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

    createFolderStructureAndReadmes({ basePath: projectDir + "/src", folders, withReadmes: true });

}

function customiseBaseProject({ projectDir, formattedProjectName }) {

    console.log("🔧 Updating the index title...");
    const indexHtmlPath = path.join(projectDir, "index.html");
    console.log("ⓘ indexHtmlPath: ", indexHtmlPath);
    const indexHtmlContent = readFileSync(indexHtmlPath, "utf-8");
    const updatedIndexHtmlContent = indexHtmlContent.replace(
        /<title>.*<\/title>/,
        `<title>${formattedProjectName}</title>`
    );
    writeFileSync(indexHtmlPath, updatedIndexHtmlContent, "utf-8");
    console.log("✅ The index title has been updated");

    const baseCssPath = path.join(projectDir, "src", "assets", "base.css");
    console.log("ⓘ baseCssPath: ", baseCssPath);
    const updatedBaseCssContent = '@import "tailwindcss";\n';
    writeFileSync(baseCssPath, updatedBaseCssContent, "utf-8");
    console.log("✅ The base.css has been updated");

    const mainCssPath = path.join(projectDir, "src", "assets", "main.css");
    console.log("ⓘ mainCssPath: ", mainCssPath);
    const updatedMainCssContent = "@import './base.css';\n";
    writeFileSync(mainCssPath, updatedMainCssContent, "utf-8");
    console.log("✅ The main.css has been updated");

    const appVuePath = path.join(projectDir, "src", "App.vue");
    console.log("ⓘ appVuePath: ", appVuePath);

    const updatedAppVueContent = `<template><div><div class="h-1/3 w-full flex items-center justify-center"><h1 class="text-3xl font-bold underline">${formattedProjectName} with VueJs (vite)</h1></div><div><p class="mt-4 text-gray-500 text-3xl">${getFormattedDate()}</p></div></div></template>`;
    writeFileSync(appVuePath, updatedAppVueContent, "utf-8");
    console.log("✅ The App.vue has been updated");

}