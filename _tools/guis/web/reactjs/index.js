import { execSync } from "child_process";
import { cl, cr } from "../../../common/logging";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { createFolderStructureAndReadmes, getFormattedDate, sanitiseText } from "../../../common/common";

export default async function ({ projectName, parentProjectDir }) {

    try {
        cl(`\nCreating ReactJs project: ${projectName}...`);
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
    cl(`\n1. Initialising ReactJs project: ${projectName}...`);
    execSync(`bun create vite@latest ${projectName} --template react-ts > /dev/null 2>&1`, {
        stdio: "inherit",
    });
    cl("   Done!");
}

function setupFramework({ projectName, parentProjectDir }) {
    cl(`\n2. Setting up ReactJs project: ${projectName}...`);
    process.chdir(projectName);
    const viteConfigPath = join(parentProjectDir, projectName, "vite.config.ts");
    let viteConfigContent = readFileSync(viteConfigPath, "utf-8");
    const lines = viteConfigContent.split("\n");
    const pathImportLine = `import path from "path";`;
    lines.splice(0, 0, pathImportLine);
    execSync("bun add --silent tailwindcss @tailwindcss/vite");
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
    cl("   Done!");
}

function createSuggestedFolderStructure({ projectName, parentProjectDir }) {
    cl(`\n3. Creating suggested folder structure`);
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
    const indexCssPath = join(parentProjectDir, projectName, "src", "index.css");
    const globalCssPath = join(parentProjectDir, projectName, "src", "styles", "global.css");
    const globalCssContent = '@import "tailwindcss";\n';
    writeFileSync(globalCssPath, globalCssContent, "utf-8");
    unlinkSync(indexCssPath);
    const mainTsxPath = join(parentProjectDir, projectName, "src", "main.tsx");
    let mainTsxContent = readFileSync(mainTsxPath, "utf-8");
    mainTsxContent = mainTsxContent.replace(/["']\.\/index\.css["']/, '"./styles/global.css"');
    writeFileSync(mainTsxPath, mainTsxContent, "utf-8");
    const appCssPath = join(parentProjectDir, projectName, "src", "App.css");
    writeFileSync(appCssPath, "", "utf-8");
    const appTsPath = join(parentProjectDir, projectName, "src", "App.tsx");
    let appTsContent = readFileSync(appTsPath, "utf-8");
    appTsContent = appTsContent.replace(
        /import\s+reactLogo\s+from\s+['"].*?['"]\s*(;|\n)?/gi, // Improved regex
        ""
    );
    appTsContent = appTsContent.replace(
        /import\s+viteLogo\s+from\s+['"].*?['"]\s*(;|\n)?/gi, // Improved regex
        ""
    );
    appTsContent = appTsContent.replace(
        /const\s*\[\s*count\s*,\s*setCount\s*\]\s*=\s*useState\s*\(\s*0\s*\);?/g,
        ""
    );
    appTsContent = appTsContent.replace(
        /import\s*{\s*useState\s*}\s+from\s+['"]react['"]\s*(;|\n)?/g,
        ""
    );
    const updatedAppTsContent = appTsContent.replace(
        /(<>\s*)(.*?)(\s*<\/>)/s, // Match everything inside the fragment, including spaces
        `<div><div className="h-1/3 w-full flex items-center justify-center"><h1 className="text-3xl font-bold underline">${formattedProjectName} with reactjs (vite)</h1></div><div><p className="mt-4 text-gray-500 text-3xl">${getFormattedDate()}</p></div></div>`
    );
    writeFileSync(appTsPath, updatedAppTsContent, "utf-8");
    cl(`   Done!`);
}