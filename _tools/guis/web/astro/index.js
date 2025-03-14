import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { assemblePath, createFolderStructureAndReadmes, getFormattedDate, sanitiseText, validateProjectName } from "../../../common/common";

export default async function (projectName) {
    validateProjectName(projectName);

    const paths = await assemblePath({ projectName, projectRoot: "__GEN_PROJECTS", rootPath: "guis/web", tech: "astro" });

    console.log(`🚀 Creating Astro project: ${projectName}...`);

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
    console.log(`🚀 Initialising Astro project: ${projectName}...`);

    console.log(`🔧 Changing working directory to ${techDir}`);
    process.chdir(techDir);

    console.log(`🔧 Creating Astro project ${projectName}`);
    execSync(`bun create astro@latest ${projectName} --template basics --install --no-git`, {
        stdio: "inherit",
    });

    console.log(`🔧 Changing working directory to ${projectDir}`);
    process.chdir(projectDir);

    console.log(`🔧 Installing dependencies`);
    execSync("bun install", { stdio: "inherit" });

    console.log("✅ Initialisation of Astro project completed");

}

function setupFramework({ projectName, projectDir }) {
    console.log(`🚀 Setting up Astro project: ${projectName}...`);

    console.log(`🔧 Changing working directory to ${projectDir}`);
    process.chdir(projectDir);

    console.log(`🔧 Adding Tailwind CSS for ${projectName}`);
    execSync("bun astro add tailwind -y", { stdio: "inherit" });

    console.log("✅ Setting up Astro project completed");

}

function createSuggestedFolderStructure({ projectDir }) {
    console.log(`🔧 Creating suggested folder structure`);

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

    createFolderStructureAndReadmes({ basePath: projectDir + "/src", folders, withReadmes: true });

}

function customiseBaseProject({ projectDir, formattedProjectName }) {
    console.log("🔧 Updating the layout.astro title...");
    const layoutAstroPath = path.join(projectDir, "src", "layouts", "Layout.astro");
    console.log("ⓘ layoutAstroPath: ", layoutAstroPath);
    const layoutAstroContent = readFileSync(layoutAstroPath, "utf-8");
    const updatedlayoutAstroContent =
        '---\n import "../styles/global.css";\n ---\n\n' +
        layoutAstroContent.replace(
            /<title>.*<\/title>/,
            `<title>${formattedProjectName}</title>`
        );
    writeFileSync(layoutAstroPath, updatedlayoutAstroContent, "utf-8");
    console.log("✅ The layout.astro title has been updated");

    console.log("🔧 Updating the index.astro...");
    const indexAstroPath = path.join(projectDir, "src", "pages", "index.astro");
    console.log("ⓘ indexAstroPath: ", indexAstroPath);
    let indexAstroContent = readFileSync(indexAstroPath, "utf-8");
    const newContent = `\n<div><div class="h-1/3 w-full flex items-center justify-center"><h1 class="text-3xl font-bold underline">${formattedProjectName} with with astro</h1></div><div><p class="mt-4 text-gray-500 text-3xl">${getFormattedDate()}</p></div></div>\n\n`;
    indexAstroContent = indexAstroContent.replace(
        /(<Welcome\s*\/>)/,
        newContent + "$1"
    );
    writeFileSync(indexAstroPath, indexAstroContent, "utf-8");
    console.log("✅ The index.astro has been updated");
}