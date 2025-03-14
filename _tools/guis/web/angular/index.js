import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { assemblePath, createFolderStructureAndReadmes, getFormattedDate, sanitiseText, validateProjectName } from "../../../common/common.js";

export default async function (projectName) {
    validateProjectName(projectName);

    const paths = await assemblePath({ projectName, projectRoot: "__GEN_PROJECTS", rootPath: "guis/web", tech: "angular" });

    console.log(`🚀 Creating Angular project: ${projectName}...`);

    try {

        initialiseFramework({ projectName, techDir: paths.techDir, projectDir: paths.projectDir });

        setupFramework({ projectName, projectDir: paths.projectDir });

        createSuggestedFolderStructure({ projectDir: paths.projectDir });

        customiseBaseProject({ projectDir: paths.projectDir, formattedProjectName: sanitiseText({ text: projectName, capitalize: true }) });

        console.log(`✅ Project setup completed and ready at ${paths.projectDir}`);
        console.log("🚀 Happy coding!");

        console.log("ⓘ Run the following command to start the development server:");
        console.log(`ⓘ cd ./${paths.relativeProjectDir}`);
        console.log("ⓘ bun run start");

        console.log("🚀 Starting the development server...");
        execSync("bun run start", { stdio: "inherit" });

    } catch (error) {
        console.error(error);
    }
};

function initialiseFramework({ projectName, techDir, projectDir }) {
    console.log(`🚀 Initialising Angular project: ${projectName}...`);

    console.log(`🔧 Changing working directory to ${techDir}`);
    process.chdir(techDir);

    console.log(`🔧 Creating Angular project ${projectName}`);
    execSync(`ng new ${projectName} --style=css --ssr=false --skip-install --package-manager bun`, {
        stdio: "inherit",
    });

    console.log(`🔧 Changing working directory to ${projectDir}`);
    process.chdir(projectDir);

    console.log(`🔧 Installing dependencies`);
    execSync("bun install", { stdio: "inherit" });

    console.log("✅ Initialisation of Angular project completed");

}

function setupFramework({ projectName, projectDir }) {
    console.log(`🚀 Setting up Angular project: ${projectName}...`);

    console.log(`🔧 Changing working directory to ${projectDir}`);
    process.chdir(projectDir);

    console.log(`🔧 Adding Tailwind CSS package`);
    execSync("bun install tailwindcss @tailwindcss/postcss postcss");

    console.log(`🔧 Configuring Tailwind CSS`);
    const postcssrcjsonContent =
        '{  "plugins": {    "@tailwindcss/postcss": {}  }}';
    writeFileSync(".postcssrc.json", postcssrcjsonContent, "utf-8");

    console.log(`🔧 Adding Tailwind CSS import to main styles.css`);
    const indexCssPath = path.join(projectDir, "src", "styles.css");
    console.log("ⓘ indexCssPath: ", indexCssPath);
    const currentContent = readFileSync(indexCssPath, "utf-8");
    const newContent = currentContent + '@import "tailwindcss";\n';
    writeFileSync(indexCssPath, newContent, "utf-8");

    console.log("✅ Setting up Angular project completed");

}

function createSuggestedFolderStructure({ projectDir }) {
    console.log(`🔧 Creating suggested folder structure`);

    const folders = [
        { name: "core", readmeHeader: "# Core module for singleton services and global config" },
        { name: "core/services", readmeHeader: "## Singleton services (Auth, API, Logging, etc.)" },
        { name: "core/guards", readmeHeader: "## Route guards for protecting routes" },
        { name: "core/interceptors", readmeHeader: "## HTTP interceptors for modifying requests and responses" },
        { name: "core/models", readmeHeader: "## Global interfaces and models" },

        { name: "shared", readmeHeader: "# Shared module for reusable components, directives, and pipes" },
        { name: "shared/components", readmeHeader: "## UI components (buttons, modals, etc.)" },
        { name: "shared/directives", readmeHeader: "## Custom directives" },
        { name: "shared/pipes", readmeHeader: "## Custom pipes" },

        { name: "features", readmeHeader: "# Feature modules (lazy-loaded when possible)" },
        { name: "features/home", readmeHeader: "## Home feature module" },
        { name: "features/auth", readmeHeader: "## Authentication module" },
        { name: "features/dashboard", readmeHeader: "## Dashboard feature module" },

        { name: "layouts", readmeHeader: "# Layout components (header, sidebar, etc.)" },
        { name: "layouts/main-layout", readmeHeader: "## Main layout" },
        { name: "layouts/auth-layout", readmeHeader: "## Authentication layout" },

        { name: "store", readmeHeader: "# Global state management (NgRx, signals, or services)" },
        { name: "store/actions", readmeHeader: "## State actions" },
        { name: "store/reducers", readmeHeader: "## Reducers for managing state updates" },
        { name: "store/selectors", readmeHeader: "## Selectors for retrieving specific state slices" },
        { name: "store/effects", readmeHeader: "## Effects for handling side effects like API calls" },

        { name: "config", readmeHeader: "# Environment and global app config" },

        { name: "assets", readmeHeader: "# Static assets (images, icons, etc.)" },
        { name: "environments", readmeHeader: "# Environment-specific configurations" },
        { name: "styles", readmeHeader: "# Global styles and themes" },
        { name: "testing", readmeHeader: "# Testing utilities and mocks" },
        { name: "i18n", readmeHeader: "# Internationalization (i18n) files" }
    ];

    createFolderStructureAndReadmes({ basePath: projectDir + "/src", folders, withReadmes: true });

}

function customiseBaseProject({ projectDir, formattedProjectName }) {
    console.log("🔧 Updating the index title...");
    const indexHtmlPath = path.join(projectDir, "src", "index.html");
    console.log("ⓘ indexHtmlPath: ", indexHtmlPath);
    const indexHtmlContent = readFileSync(indexHtmlPath, "utf-8");
    const updatedIndexHtmlContent = indexHtmlContent.replace(
        /<title>.*<\/title>/,
        `<title>${formattedProjectName}</title>`
    );
    writeFileSync(indexHtmlPath, updatedIndexHtmlContent, "utf-8");
    console.log("✅ The index title has been updated");

    console.log("🔧 Updating the app.component.html...");
    const appHtmlPath = path.join(projectDir, "src", "app", "app.component.html");
    console.log("ⓘ appHtmlPath: ", appHtmlPath);
    const updatedAppHtmlContent = `<div><div class="h-1/3 w-full flex items-center justify-center"><h1 class="text-3xl font-bold underline">${formattedProjectName} with angular</h1></div><div><p class="mt-4 text-gray-500 text-3xl">${getFormattedDate()}</p></div></div>`;
    writeFileSync(appHtmlPath, updatedAppHtmlContent, "utf-8");
    console.log("✅ The app.component.html has been updated");

    console.log("🔧 Updating the app.component.ts...");
    const appTsPath = path.join(projectDir, "src", "app", "app.component.ts");
    console.log("ⓘ appTsPath: ", appTsPath);
    const appTsContent = readFileSync(appTsPath, "utf-8");
    const updatedAppTsContent = appTsContent.replace("import { RouterOutlet } from '@angular/router';", "").replace("imports: [RouterOutlet],", "imports: [],").replace("title = 'movie';", `title = '${formattedProjectName}';`);
    writeFileSync(appTsPath, updatedAppTsContent, "utf-8");
    console.log("✅ The app.component.ts has been updated");
}