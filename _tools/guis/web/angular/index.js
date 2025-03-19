import { execSync } from "child_process";
import { cl, cr } from "../../../common/logging";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { createFolderStructureAndReadmes, getFormattedDate, sanitiseText } from "../../../common/common";

export default async function ({ projectName, parentProjectDir }) {

    try {
        cl(`\nCreating Angular project: ${projectName}...`);
        cl(`   The project is about to be created in this location ${parentProjectDir}`);
        initialiseFramework({ projectName });
        setupFramework({ projectName, parentProjectDir });
        createSuggestedFolderStructure({ projectName, parentProjectDir });
        prepareBaseProject({ projectName, parentProjectDir });
        cl(`\n\nProject setup completed and ready at ${join(parentProjectDir, projectName)}`);
        cl("Happy coding!");
        cl("\n\nRun the following command to start the development server:");
        cl(`cd ${projectName}`);
        cl("bun run start");
    } catch (error) {
        cr(error);
    }
}

function initialiseFramework({ projectName }) {
    cl(`\n1. Initialising Angular project: ${projectName}...`);

    cl(`   Creating Angular project ${projectName}`);
    execSync(`ng new ${projectName} --style=css --ssr=false --package-manager bun > /dev/null 2>&1`, {
        stdio: "inherit",
    });

    cl("   Done!");
}


function setupFramework({ projectName, parentProjectDir }) {
    cl(`\n2. Setting up Angular project: ${projectName}...`);
    process.chdir(projectName);
    cl(`   Adding Tailwind CSS package`);
    execSync("bun add --silent tailwindcss @tailwindcss/postcss postcss");
    const postcssrcjsonContent =
        '{  "plugins": {    "@tailwindcss/postcss": {}  }}';
    writeFileSync(".postcssrc.json", postcssrcjsonContent, "utf-8");
    const indexCssPath = join(parentProjectDir, projectName, "src", "styles.css");
    const currentContent = readFileSync(indexCssPath, "utf-8");
    const newContent = currentContent + '@import "tailwindcss";\n';
    writeFileSync(indexCssPath, newContent, "utf-8");
    cl("   Done!");
}

function createSuggestedFolderStructure({ projectName, parentProjectDir }) {
    cl(`\n3. Creating suggested folder structure`);
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
    cl("\n   " + folders.map(f => f.name).join(", "));
    createFolderStructureAndReadmes({ basePath: join(parentProjectDir, projectName) + "/src", folders, withReadmes: true });
    cl("\n   Done!");
}

function prepareBaseProject({ projectName, parentProjectDir }) {
    cl(`\n4. Preparing the base project`);
    const formattedProjectName = sanitiseText({ text: projectName, capitalize: true });
    const indexHtmlPath = join(parentProjectDir, projectName, "src", "index.html");
    const indexHtmlContent = readFileSync(indexHtmlPath, "utf-8");
    const updatedIndexHtmlContent = indexHtmlContent.replace(
        /<title>.*<\/title>/,
        `<title>${formattedProjectName}</title>`
    );
    writeFileSync(indexHtmlPath, updatedIndexHtmlContent, "utf-8");
    const appHtmlPath = join(parentProjectDir, projectName, "src", "app", "app.component.html"); const updatedAppHtmlContent = `<div><div class="h-1/3 w-full flex items-center justify-center"><h1 class="text-3xl font-bold underline">${formattedProjectName} with angular</h1></div><div><p class="mt-4 text-gray-500 text-3xl">${getFormattedDate()}</p></div></div>`;
    writeFileSync(appHtmlPath, updatedAppHtmlContent, "utf-8");
    const appTsPath = join(parentProjectDir, projectName, "src", "app", "app.component.ts"); const appTsContent = readFileSync(appTsPath, "utf-8");
    const updatedAppTsContent = appTsContent.replace("import { RouterOutlet } from '@angular/router';", "").replace("imports: [RouterOutlet],", "imports: [],").replace("title = 'movie';", `title = '${formattedProjectName}';`);
    writeFileSync(appTsPath, updatedAppTsContent, "utf-8");
    cl(`   Done!`);
}