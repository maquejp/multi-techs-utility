import { copyFileSync, mkdirSync } from "fs";
import { assemblePath, ensureFolderExists, validateProjectName } from "../../common/common";
import path from "path";
import { execSync } from "child_process";

export default async function (projectName) {
    validateProjectName(projectName);

    const paths = await assemblePath({ projectName, projectRoot: "__GEN_PROJECTS", rootPath: "backends", tech: "apiplatform" });

    console.log(`🚀 Creating ApiPlatform project: ${projectName}...`);
    console.log("ⓘ  The server will be using Docker!")

    try {

        initialiseFramework({ projectName, techDir: paths.techDir, projectDir: paths.projectDir, toolsDirTechno: paths.toolsDirTechno });

        settingContainer({ projectDir: paths.projectDir });

        console.log(`✅ Project setup completed and ready at ${paths.projectDir}`);
        console.log("🚀 Happy coding!");

        console.log("ⓘ  The development container is running");
        console.log("ⓘ  The url to access the server is http://localhost:8086");
        console.log("ⓘ  You can test the url http://localhost:8086/hello-api");

    } catch (error) {
        console.error(error);
    }
}

function initialiseFramework({ projectName, techDir, projectDir, toolsDirTechno }) {
    console.log(`🚀 Initialising ApiPlatform project: ${projectName}...`);

    const fileToCopy = ["docker-compose.yml", "Dockerfile", "default.conf", "supervisord.conf", "setup.sh"];

    ensureFolderExists(projectDir);

    fileToCopy.map((name) => {
        console.log(`🔧 Copying ${name}...`);
        copyFileSync(
            path.join(toolsDirTechno, "templates", name),
            path.join(projectDir, name)
        );
    });
}

function settingContainer({ projectDir }) {
    console.log("🚀 Starting api platform container...");

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

        console.log(`🔧 Creating the docker image if it does not exist`);
        const imageExists = execSync('docker images -q multitech-apiplatform').toString().trim();
        if (!imageExists) {
            execSync(`docker build --no-cache -t multitech-apiplatform .`, {
                stdio: "inherit",
            });
        }

        execSync(`docker compose up --build -d`, {
            stdio: "inherit",
        });

        console.log("🕐 Waiting for the container to become healthy...");
        waitForContainerHealthy("multitech-apiplatform", 60); // 60 seconds timeout

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