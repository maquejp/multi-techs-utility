import { execSync } from "child_process";
import { cl, cr } from "../../../common/logging";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { createFolderStructureAndReadmes, getFormattedDate, sanitiseText } from "../../../common/common";

export default async function ({ projectName, parentProjectDir }) {

    try {
        cl(`\nCreating Astro project: ${projectName}...`);
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
    cl(`\n1. Initialising Astro project: ${projectName}...`);
    cl(`   Creating Astro project ${projectName}`);
    execSync(`bun create astro@latest ${projectName} --template basics --install --git > /dev/null 2>&1`, {
        stdio: "inherit",
    });
    cl("   Done!");
}

function setupFramework({ projectName, parentProjectDir }) {
    cl(`\n2. Setting up Astro project: ${projectName}...`);
    process.chdir(projectName);
    execSync("bun astro add tailwind -y > /dev/null 2>&1", { stdio: "inherit" });
    cl("   Done!");
}

function createSuggestedFolderStructure({ projectName, parentProjectDir }) {
    cl(`\n3. Creating suggested folder structure`);
    const folders = [
        { name: "assets", readmeHeader: "# Project Assets\n\nStores project-specific assets like images, fonts, and icons." },
        { name: "components", readmeHeader: "# Reusable UI Components\n\nContains UI components used across multiple pages." },
        { name: "config", readmeHeader: "# Configuration Files\n\nHolds site settings, metadata, and API configurations." },
        { name: "content", readmeHeader: "# Content Collection\n\nStores Markdown/MDX files for blog posts or dynamic content." },
        { name: "layouts", readmeHeader: "# Layouts\n\nDefines reusable page layouts for consistent design." },
        { name: "pages", readmeHeader: "# Pages\n\nContains Astro pages that define routes for the site." },
        { name: "styles", readmeHeader: "# Global Styles\n\nHolds CSS, SCSS, or Tailwind styles for the project." },
        { name: "utils", readmeHeader: "# Utility Functions\n\nHelper functions for common operations like formatting dates." },
        { name: "services", readmeHeader: "# Services\n\nHandles API requests and business logic." },
        { name: "hooks", readmeHeader: "# Custom Hooks\n\nStores framework-specific custom hooks (if applicable)." }
    ];
    cl("\n   " + folders.map(f => f.name).join(", "));
    createFolderStructureAndReadmes({ basePath: join(parentProjectDir, projectName) + "/src", folders, withReadmes: true });
    cl("\n   Done!");
}

function prepareBaseProject({ projectName, parentProjectDir }) {
    cl(`\n4. Preparing the base project`);
    const formattedProjectName = sanitiseText({ text: projectName, capitalize: true });
    const layoutAstroPath = join(parentProjectDir, projectName, "src", "layouts", "Layout.astro");
    const layoutAstroContent = readFileSync(layoutAstroPath, "utf-8");
    const updatedlayoutAstroContent =
        '---\n import "../styles/global.css";\n ---\n\n' +
        layoutAstroContent.replace(
            /<title>.*<\/title>/,
            `<title>${formattedProjectName}</title>`
        );
    writeFileSync(layoutAstroPath, updatedlayoutAstroContent, "utf-8");
    const indexAstroPath = join(parentProjectDir, projectName, "src", "pages", "index.astro");
    let indexAstroContent = readFileSync(indexAstroPath, "utf-8");
    const newContent = `\n<div><div class="h-1/3 w-full flex items-center justify-center"><h1 class="text-3xl font-bold underline">${formattedProjectName} with with astro</h1></div><div><p class="mt-4 text-gray-500 text-3xl">${getFormattedDate()}</p></div></div>\n\n`;
    indexAstroContent = indexAstroContent.replace(
        /(<Welcome\s*\/>)/,
        newContent + "$1"
    );
    writeFileSync(indexAstroPath, indexAstroContent, "utf-8");
    cl(`   Done!`);
}