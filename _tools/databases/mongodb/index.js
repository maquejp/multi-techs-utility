import { execSync } from "child_process";
import { copyFileSync } from "fs-extra";
import path from "path";
import { assemblePath, ensureFolderExists, validateProjectName } from "../../common/common.js";

export default async function (projectName) {
    validateProjectName(projectName);

    const paths = await assemblePath({ projectName, projectRoot: "__GEN_PROJECTS", rootPath: "databases", tech: "mongodb" });

    console.log(`🚀 Creating MongoDB project: ${projectName}...`);

    try {
        initialiseFramework({ projectName, techDir: paths.techDir, projectDir: paths.projectDir, toolsDirTechno: paths.toolsDirTechno });

        settingContainer({ projectDir: paths.projectDir });

        console.log(`✅ Project setup completed and ready at ${paths.projectDir}`);
        console.log("🚀 Happy coding!");

        console.log("ⓘ  The development container is running");
        console.log("ⓘ  The host url is localhost:27017");
        console.log("ⓘ  The usename is mongodbadmin");

    } catch (error) {
        console.error("❌ Project initialization failed:", error);
    }
}

function initialiseFramework({ projectName, techDir, projectDir, toolsDirTechno }) {
    console.log(`🚀 Initialising MongoDB project: ${projectName}...`);

    ensureFolderExists(projectDir);
    ensureFolderExists(projectDir + "/" + "config");
    ensureFolderExists(projectDir + "/" + "data");

    try {
        // Set permissions (Linux/macOS only)
        if (process.platform !== "win32") {
            execSync(`chmod 777 -R ${techDir}`);
            execSync(`chmod 777 -R ${projectDir}`);
        } else {
            console.log("ⓘ Skipping chmod for Windows platform.");
        }
    } catch (error) {
        console.warn("❌ Could not set permissions on:", techDir);
    }

    const fileToCopy = ["docker-compose.yml"];

    fileToCopy.map((name) => {
        console.log(`🔧 Copying ${name}...`);
        copyFileSync(
            path.join(toolsDirTechno, "templates", name),
            path.join(projectDir, name)
        );
    });
}

function settingContainer({ projectDir }) {
    console.log("🚀 Starting MongoDB container...");

    console.log(`🔧 Changing working directory to ${projectDir}`);
    process.chdir(projectDir);

    try {
        console.log(`🔧 Create the multitech-common docker bridged network if needed`);
        try {
            // Check if the network already exists
            const existingNetworks = execSync("docker network ls --format '{{.Name}}'")
                .toString()
                .split("\n")
                .map(name => name.trim());

            if (!existingNetworks.includes("multitech-common-network")) {
                // Network does not exist, create it
                execSync("docker network create --driver bridge --subnet 172.40.0.0/16 multitech-common-network", {
                    stdio: "inherit",
                });
                console.log("Docker network 'multitech-common-network' created.");
            } else {
                console.log("Docker network 'multitech-common-network' already exists. Skipping creation.");
            }
        } catch (error) {
            console.error("Error checking or creating the multitech-common Docker bridged network:", error);
        }

        execSync(`docker compose up --build -d`, {
            stdio: "inherit",
        });

        console.log("🕐 Waiting for the container to become healthy...");
        waitForContainerHealthy("multitech-mongodb-server", 60); // 60 seconds timeout

        console.log("✅ Container is healthy and ready to use!");

    } catch (error) {
        console.error("❌ Error starting api platform container");
        process.exit(1);
    }
}

function waitForContainerHealthy(containerName, timeoutSeconds) {
    const startTime = Date.now();
    while (true) {
        try {
            const healthStatus = execSync(
                `docker inspect --format='{{.State.Health.Status}}' $(docker ps -q --filter "name=${containerName}")`
            ).toString().trim();

            if (healthStatus === "healthy") {
                return;
            }

            if (Date.now() - startTime > timeoutSeconds * 1000) {
                console.error("❌ Timeout: Container did not become healthy in time.");
                process.exit(1);
            }
        } catch (error) {
            console.warn("🔧 Waiting for container to start...");
        }

        // Wait for a few seconds before checking again
        execSync("sleep 3");
    }
}