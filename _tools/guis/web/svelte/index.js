import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { assemblePath, createFolderStructureAndReadmes, getFormattedDate, sanitiseText, validateProjectName } from "../../../common/common";

export default async function (projectName) {
    validateProjectName(projectName);

    const paths = await assemblePath({ projectName, projectRoot: "__GEN_PROJECTS", rootPath: "guis/web", tech: "svelte" });

    console.log(`🚀 Creating Svelte project: ${projectName}...`);

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
    console.log(`🚀 Initialising Svelte project: ${projectName}...`);

    console.log(`🔧 Changing working directory to ${techDir}`);
    process.chdir(techDir);

    console.log(`🔧 Creating Svelte project ${projectName}`);
    execSync(`bun create vite@latest ${projectName} --template svelte-ts`, {
        stdio: "inherit",
    });

    console.log(`🔧 Changing working directory to ${projectDir}`);
    process.chdir(projectDir);

    console.log(`🔧 Installing dependencies`);
    execSync("bun install", { stdio: "inherit" });

    console.log("✅ Initialisation of Svelte project completed");
}

function setupFramework({ projectName, projectDir }) {
    console.log(`🚀 Setting up Svelte project: ${projectName}...`);

    console.log(`🔧 Adding Tailwind CSS for ${projectName}`);
    execSync("bun add tailwindcss @tailwindcss/vite");

    console.log("🔧 Configuring Tailwind CSS...");
    const viteConfigPath = path.join(projectDir, "vite.config.ts");
    console.log("ⓘ viteConfigPath: ", viteConfigPath);

    let viteConfigContent = readFileSync(viteConfigPath, "utf-8");

    console.log("🔧 Adding Tailwind CSS import...");
    const lines = viteConfigContent.split("\n");
    const tailwindImportLine = "import tailwindcss from '@tailwindcss/vite'";
    const insertIndex = 2;
    lines.splice(insertIndex, 0, tailwindImportLine);
    viteConfigContent = lines.join("\n");

    console.log("🔧 Adding Tailwind CSS to Vite plugins...");
    viteConfigContent = viteConfigContent.replace(
        /plugins:\s*\[\s*svelte\(\)\s*\]/,
        "plugins: [svelte(), tailwindcss()]"
    );

    console.log("🔧 Adding server configuration...");
    if (!/server:\s*\{/.test(viteConfigContent)) {
        viteConfigContent = viteConfigContent.replace(
            /plugins:\s*\[.*?\]\s*,/s, // Match plugins array
            match => `${match}\n  server: {\n    port: 51732,\n  },`
        );
    }

    writeFileSync(viteConfigPath, viteConfigContent, "utf-8");

    console.log("✅ Setting up Svelte project completed");

}

function createSuggestedFolderStructure({ projectDir }) {
    console.log(`🔧 Creating suggested folder structure`);

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

    console.log("🔧 Updating the app.css...");
    const appCssPath = path.join(projectDir, "src", "app.css");
    console.log("ⓘ appCssPath: ", appCssPath);
    const updatedAppCssContent = '@import "tailwindcss";\n';
    writeFileSync(appCssPath, updatedAppCssContent, "utf-8");
    console.log("✅ The app.css has been updated");

    console.log("🔧 Updating the App.svelte...");
    const appSveltePath = path.join(projectDir, "src", "App.svelte");
    console.log("ⓘ appSveltePath: ", appSveltePath);

    const updatedAppSvelteContent = `<div><div class="h-1/3 w-full flex items-center justify-center"><h1 class="text-3xl font-bold underline">${formattedProjectName} with svelte (vite)</h1></div><div><p class="mt-4 text-gray-500 text-3xl">${getFormattedDate()}</p></div></div>`;
    writeFileSync(appSveltePath, updatedAppSvelteContent, "utf-8");
    console.log("✅ The App.svelte has been updated");

}