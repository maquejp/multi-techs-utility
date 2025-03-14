import { execSync, spawn } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import https from 'https';
import path from "path";
import tar from 'tar';
import { createGunzip } from 'zlib';
import { assemblePath, createFolderStructureAndReadmes, getFormattedDate, sanitiseText, validateProjectName } from "../../common/common";

const javaPath = execSync(process.platform === 'win32' ? 'where java' : 'which java').toString().trim();
const javaHome = path.dirname(path.dirname(javaPath));

let packageName = "package-name";
const groupId = "net.maquestiaux"

export default async function (projectName) {
    validateProjectName(projectName);

    const paths = await assemblePath({ projectName, projectRoot: "__GEN_PROJECTS", rootPath: "backends", tech: "springboot" });

    packageName = `${groupId}.${projectName}`;

    console.log(`🚀 Creating SpringBoot project: ${projectName}...`);

    try {
        await initialiseFramework({ projectName, techDir: paths.techDir, projectDir: paths.projectDir });

        createSuggestedFolderStructure({ projectDir: paths.projectDir });

        customiseBaseProject({ projectDir: paths.projectDir, formattedProjectName: sanitiseText({ text: projectName, capitalize: true }) });

        startSpringBoot(paths.projectDir);

    } catch (error) {
        console.error("❌ Project initialization failed:", error);
    }
}

async function initialiseFramework({ projectName, techDir, projectDir }) {
    return new Promise((resolve, reject) => {
        console.log(`🚀 Initialising SpringBoot project: ${projectName}...`);

        const springBootUrl = `https://start.spring.io/starter.tgz?type=maven-project&language=java&javaVersion=21&bootVersion=3.4.3&packaging=jar&groupId=${groupId}&artifactId=${projectName}&name=${projectName}&packageName=${packageName}&dependencies=web,devtools`;

        console.log("🔧 Downloading Spring Boot project...");
        console.log(`ⓘ  Spring IO Url: ${springBootUrl}`);

        mkdirSync(projectDir);
        console.log(`📂 Created folder: ${projectDir}`);

        https.get(springBootUrl, (response) => {
            if (response.statusCode !== 200) {
                return reject(`❌ Failed to download Spring Boot project: ${response.statusMessage}`);
            }

            const extract = tar.extract({ cwd: projectDir });

            response.pipe(createGunzip()).pipe(extract);

            extract.on("finish", () => {
                console.log("✅ Spring Boot project created successfully.");

                console.log("🔧 Setting execute permissions for mvnw...");
                execSync(`chmod +x ${projectDir}/mvnw`);

                console.log("🔧 Generating missing Maven wrapper files...");
                process.chdir(projectDir);
                execSync(`./mvnw wrapper:wrapper`, {
                    stdio: "inherit",
                    env: { ...process.env, JAVA_HOME: javaHome },
                });

                console.log(`✅ Project setup completed and ready at ${projectDir}`);
                console.log("🚀 Happy coding!");
                console.log("ⓘ  Go to http://localhost:8080");

                resolve(); // Indicate successful completion
            });

            extract.on("error", (err) => reject(`❌ Extraction error: ${err}`));
        }).on("error", (err) => reject(`❌ Download error: ${err}`));
    });
}

function startSpringBoot(projectDir) {
    console.log("🚀 Starting Spring Boot application...");

    const springBootProcess = spawn(`./mvnw`, ["spring-boot:run"], {
        cwd: projectDir,
        stdio: "inherit",
        env: { ...process.env, JAVA_HOME: javaHome },
    });

    springBootProcess.on("error", (error) => {
        console.error("❌ Error starting Spring Boot application:", error);
    });

    springBootProcess.on("close", (code) => {
        if (code !== 0) {
            console.error(`❌ Spring Boot application exited with code ${code}`);
        }
    });
}

function createSuggestedFolderStructure({ projectDir }) {
    console.log(`🔧 Creating suggested folder structure`);

    const folders = [
        { "name": "config", "readmeHeader": "# Configuration\n\nContains application configuration files and settings." },
        { "name": "controller", "readmeHeader": "# Controllers\n\nContains REST controllers handling API requests." },
        { "name": "service", "readmeHeader": "# Services\n\nContains business logic and service classes." },
        { "name": "repository", "readmeHeader": "# Repositories\n\nContains database access logic using Spring Data JPA." },
        { "name": "model", "readmeHeader": "# Models\n\nContains domain models and entity definitions." }, { "name": "dto", "readmeHeader": "# DTOs\n\nContains Data Transfer Objects for API communication." },
        { "name": "exception", "readmeHeader": "# Exception Handling\n\nContains custom exceptions and global error handling." },
        { "name": "security", "readmeHeader": "# Security\n\nContains security-related configurations and logic (e.g., JWT, authentication)." },
        { "name": "util", "readmeHeader": "# Utilities\n\nContains helper and utility functions used across the application." }
    ];

    createFolderStructureAndReadmes({ basePath: path.join(projectDir, "src", "main", "java", packageName.split('.').join("/")), folders, withReadmes: true });

}

function customiseBaseProject({ projectDir, formattedProjectName }) {
    const controllerCode = `
    package ${packageName};
    
    import org.springframework.web.bind.annotation.RestController;
    import org.springframework.web.bind.annotation.GetMapping;
    
    @RestController
    public class HelloController {
    
        @GetMapping("/hello")
        public String hello() {
            return "Hello ${formattedProjectName} with SpringBoot!<br/>${getFormattedDate()}";
        }
    
    }
    `;

    const sourcePath = path.join(projectDir, "src", "main", "java", packageName.split('.').join("/"), "controller", "HelloController.java");
    writeFileSync(sourcePath, controllerCode.trim(), "utf8");

}