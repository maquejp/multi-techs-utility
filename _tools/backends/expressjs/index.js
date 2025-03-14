import { execSync } from "child_process";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { assemblePath, createFolderStructureAndReadmes, getFormattedDate, sanitiseText, validateProjectName } from "../../common/common";

export default async function (projectName) {
    validateProjectName(projectName);

    const paths = await assemblePath({ projectName, projectRoot: "__GEN_PROJECTS", rootPath: "backends", tech: "expressjs" });

    console.log(`🚀 Creating ExpressJs project: ${projectName}...`);

    try {

        initialiseFramework({ projectName, techDir: paths.techDir, projectDir: paths.projectDir });

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
}

function initialiseFramework({ projectName, techDir, projectDir }) {
    console.log(`🚀 Initialising ExpressJs project: ${projectName}...`);

    mkdirSync(projectDir);
    console.log(`📂 Created folder: ${projectDir}`);

    console.log(`🔧 Changing working directory to ${projectDir}`);
    process.chdir(projectDir);

    execSync(`bun init -y`, { stdio: "inherit" });

    console.log("🔧 Installing dependencies...");
    execSync(`bun add express dotenv prisma @prisma/client`, { stdio: "inherit" });

    console.log("🔧 Installing Dev dependencies...");
    execSync(`bun add -d typescript tsx @types/node @types/express`, { stdio: "inherit" });

    console.log("🔧 Creating tsconfig.json...");
    const TSCONFIG_CONTENT = `{
        "compilerOptions": {
            "target": "ESNext",
            "module": "ESNext",
            "moduleResolution": "bundler",
            "strict": true,
            "rootDir": "src",
            "outDir": "dist",
            "esModuleInterop": true,
            "forceConsistentCasingInFileNames": true
        },
        "include": ["src"]
    }`;

    writeFileSync(path.join(projectDir, "tsconfig.json"), TSCONFIG_CONTENT);

    console.log("🔧 Adapting the package.json...");
    const PACKAGE_JSON_PATH = path.join(projectDir, "package.json");
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.start = "bun run --watch src/server.ts";
    packageJson.scripts["prisma:init"] = "prisma init";
    packageJson.scripts["prisma:generate"] = "prisma generate";
    packageJson.scripts["prisma:migrate:init"] = "prisma migrate dev --name init";
    packageJson.scripts["prisma:migrate"] = "prisma migrate dev";
    packageJson.scripts["prisma:validate"] = "prisma validate";
    packageJson.scripts["prisma:format"] = "prisma format";
    packageJson.scripts["prisma:db:pull"] = "prisma db pull";
    packageJson.scripts["prisma:db:push"] = "prisma db push";

    if (packageJson.module) {
        delete packageJson.module;
    }

    writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));

    console.log("✅ Initialisation of ExpressJs project completed");
}

function createSuggestedFolderStructure({ projectDir }) {
    console.log(`🔧 Creating suggested folder structure`);

    const folders = [
        { "name": "src", "readmeHeader": "# Source Code\n\nContains all the core application logic." },
        { "name": "src/config", "readmeHeader": "# Configuration\n\nStores configuration files such as database connections and environment settings." },
        { "name": "src/routes", "readmeHeader": "# Routes\n\nDefines API endpoints and their handlers." },
        { "name": "src/controllers", "readmeHeader": "# Controllers\n\nHandles request processing and response logic." },
        { "name": "src/services", "readmeHeader": "# Services\n\nContains business logic and database interactions." },
        { "name": "src/models", "readmeHeader": "# Models\n\nDefines database schemas (if using an ORM like Sequelize or Mongoose)." },
        { "name": "src/middleware", "readmeHeader": "# Middleware\n\nCustom middleware for authentication, logging, etc." },
        { "name": "src/utils", "readmeHeader": "# Utilities\n\nHelper functions and utility methods." },
        { "name": "public", "readmeHeader": "# Public Assets\n\nStatic files like images, CSS, and client-side JavaScript." },
        { "name": "tests", "readmeHeader": "# Tests\n\nUnit and integration tests for the application." }

    ];

    createFolderStructureAndReadmes({ basePath: projectDir, folders, withReadmes: true });

}

function customiseBaseProject({ projectDir, formattedProjectName }) {
    const fileContent = `import express, { Request, Response } from "express";
    import dotenv from "dotenv";

    dotenv.config();

    const app = express();
    const PORT = process.env.PORT || 3000;
    
    // Middleware
    app.use(express.json());
    
    // Default route
    app.get("/", (req: Request, res: Response) => {
        res.send("${formattedProjectName} with ExpressJs<br/>${getFormattedDate()}");
    });
    
    // Start server
    app.listen(PORT, () => {
        console.log(\`Server is running on http://localhost:\${PORT}\`);
    });
    `;

    writeFileSync(path.join(projectDir, "src/server.ts"), fileContent);

}