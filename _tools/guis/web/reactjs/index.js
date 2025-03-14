import { execSync } from "child_process";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import { assemblePath, createFolderStructureAndReadmes, getFormattedDate, sanitiseText, validateProjectName } from "../../../common/common";

export default async function (projectName) {
    validateProjectName(projectName);

    const paths = await assemblePath({ projectName, projectRoot: "__GEN_PROJECTS", rootPath: "guis/web", tech: "reactjs" });

    console.log(`🚀 Creating ReactJs project: ${projectName}...`);

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
    console.log(`🚀 Initialising ReactJs project: ${projectName}...`);

    console.log(`🔧 Changing working directory to ${techDir}`);
    process.chdir(techDir);

    console.log(`🔧 Creating ReactJs (with Vite) project ${projectName}`);
    execSync(`bun create vite@latest ${projectName} --template react-ts`, {
        stdio: "inherit",
    });

    console.log(`🔧 Changing working directory to ${projectDir}`);
    process.chdir(projectDir);

    console.log(`🔧 Installing dependencies`);
    execSync("bun install", { stdio: "inherit" });

    console.log("✅ Initialisation of ReactJs project completed");
}

function setupFramework({ projectName, projectDir }) {
    console.log(`🚀 Setting up ReactJs project: ${projectName}...`);

    console.log("🔧 Loading Vite config file...");
    const viteConfigPath = path.join(projectDir, "vite.config.ts");
    console.log("ⓘ viteConfigPath: ", viteConfigPath);

    let viteConfigContent = readFileSync(viteConfigPath, "utf-8");
    const lines = viteConfigContent.split("\n");

    console.log("🔧 Adding path import to Vite config file...");
    const pathImportLine = `import path from "path";`;
    lines.splice(0, 0, pathImportLine);

    console.log(`🔧 Adding Tailwind CSS package for ${projectName}`);
    execSync("bun add tailwindcss @tailwindcss/vite");

    const tailwindImportLine = "import tailwindcss from '@tailwindcss/vite'";
    const insertIndex = 3;
    lines.splice(insertIndex, 0, tailwindImportLine);
    viteConfigContent = lines.join("\n");

    viteConfigContent = viteConfigContent.replace(
        /plugins:\s*\[\s*react\(\)\s*\]/,
        "plugins: [react(), tailwindcss()]"
    );

    if (!/server:\s*\{/.test(viteConfigContent)) {
        viteConfigContent = viteConfigContent.replace(
            /plugins:\s*\[.*?\]\s*,/s, // Match plugins array
            match => `${match}\n  server: {\n    port: 51731,\n  },`
        );
    }

    if (!/resolve:\s*\{/.test(viteConfigContent)) {
        viteConfigContent = viteConfigContent.replace(
            /server:\s*\{[^}]*\},/s, // Match server block
            match => `${match}\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "src"),\n    },\n  },`
        );
    }

    writeFileSync(viteConfigPath, viteConfigContent, "utf-8");
    console.log("✅ Tailwind CSS has been added to vite.config.ts");

    console.log("✅ Setting up ReactJs project completed");

}

function createSuggestedFolderStructure({ projectDir }) {
    console.log(`🔧 Creating suggested folder structure`);

    const folders = [
        { name: "components", readmeHeader: "# Reusable UI components" },
        { name: "hooks", readmeHeader: "# Reusable UI components" },
        { name: "layouts", readmeHeader: "# Layout components (header, footer, sidebar, etc.)" },
        { name: "pages", readmeHeader: "# Page components (route-based structure)" },
        { name: "routes", readmeHeader: "# React Router configurations" },
        { name: "contexts", readmeHeader: "# React Context API configurations" },
        { name: "services", readmeHeader: "# API calls, Firebase, or third-party integrations" },
        { name: "stores", readmeHeader: "# Global state management (Zustand, Redux, etc.)" },
        { name: "utils", readmeHeader: "# Utility functions (helpers, validators, etc.)" },
        { name: "config", readmeHeader: "# Configuration files (environment variables, API keys, etc.)" },
        { name: "types", readmeHeader: "# TypeScript types and interfaces" },
        { name: "styles", readmeHeader: "# Global styles (Tailwind directives, CSS files, etc.)" },
        { name: "tests", readmeHeader: "# Unit tests, integration tests, and end-to-end tests" }
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

    console.log("🔧 Updating and moving the index.css...");
    const indexCssPath = path.join(projectDir, "src", "index.css");
    console.log("ⓘ indexCssPath: ", indexCssPath);
    const globalCssPath = path.join(projectDir, "src", "styles", "global.css");
    console.log("ⓘ globalCssPath: ", globalCssPath);
    const globalCssContent = '@import "tailwindcss";\n';
    writeFileSync(globalCssPath, globalCssContent, "utf-8");
    unlinkSync(indexCssPath);
    console.log("✅ index.css has been moved and updated as styles/global.css");

    console.log("🔧 Updating the main.tsx...");
    const mainTsxPath = path.join(projectDir, "src", "main.tsx");
    console.log("ⓘ mainTsxPath: ", mainTsxPath);
    let mainTsxContent = readFileSync(mainTsxPath, "utf-8");
    mainTsxContent = mainTsxContent.replace(/["']\.\/index\.css["']/, '"./styles/global.css"');
    writeFileSync(mainTsxPath, mainTsxContent, "utf-8");
    console.log("✅ main.tsx has been updated to import styles/global.css");

    console.log("🔧 Emptying the App.css...");
    const appCssPath = path.join(projectDir, "src", "App.css");
    console.log("ⓘ appCssPath: ", appCssPath);
    writeFileSync(appCssPath, "", "utf-8");
    console.log("✅ The App.css has been emptied");

    console.log("🔧 Updating the App.tsx...");
    const appTsPath = path.join(projectDir, "src", "App.tsx");
    console.log("ⓘ appTsPath: ", appTsPath);
    let appTsContent = readFileSync(appTsPath, "utf-8");

    console.log("🔧 Removing the react logo import...");
    appTsContent = appTsContent.replace(
        /import\s+reactLogo\s+from\s+['"].*?['"]\s*(;|\n)?/gi, // Improved regex
        ""
    );

    console.log("🔧 Removing the vite logo import...");
    appTsContent = appTsContent.replace(
        /import\s+viteLogo\s+from\s+['"].*?['"]\s*(;|\n)?/gi, // Improved regex
        ""
    );

    console.log("🔧 Remove the react useState hook...");
    appTsContent = appTsContent.replace(
        /const\s*\[\s*count\s*,\s*setCount\s*\]\s*=\s*useState\s*\(\s*0\s*\);?/g,
        ""
    );

    console.log("🔧 Remove the react usestate import...");
    appTsContent = appTsContent.replace(
        /import\s*{\s*useState\s*}\s+from\s+['"]react['"]\s*(;|\n)?/g,
        ""
    );

    console.log("🔧 Update the App.tsx content...");
    const updatedAppTsContent = appTsContent.replace(
        /(<>\s*)(.*?)(\s*<\/>)/s, // Match everything inside the fragment, including spaces
        `<div><div className="h-1/3 w-full flex items-center justify-center"><h1 className="text-3xl font-bold underline">${formattedProjectName} with reactjs (vite)</h1></div><div><p className="mt-4 text-gray-500 text-3xl">${getFormattedDate()}</p></div></div>`
    );
    writeFileSync(appTsPath, updatedAppTsContent, "utf-8");

}