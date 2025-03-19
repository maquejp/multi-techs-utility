import { mkdirSync, existsSync, writeFileSync } from "fs";
import path from "path";

/**
 * Ensures that a folder exists, creating it if necessary.
 * @param {string} folderPath - The folder path to ensure.
 */
export function ensureFolderExists(folderPath) {
    if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
    }
}

/**
 * Validates the project name format.
 * @param {string} projectName - The name of the project.
 */
export function validateProjectName(projectName) {
    if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
        console.error("❌ Invalid project name! Only letters, numbers, dashes, and underscores are allowed.");
        process.exit(1);
    }
    if (projectName.length < 4) {
        console.error("❌ Project name is too short! It must be at least 4 characters.");
        process.exit(1);
    }
}

export async function assemblePath({
    projectName,
    projectRoot = "",
    rootPath = "unknown",
    tech = "unknown"
}) {
    console.log(`🚀 Preparing the paths for the project: ${projectName}...`);
    const rootDir = process.cwd();
    console.log("ⓘ  rootDir: ", rootDir);

    const toolsDirTechno = process.cwd() + "/" + "_tools" + "/" + rootPath + "/" + tech;
    console.log("ⓘ  toolsDirTechno: ", toolsDirTechno);

    const baseDir = path.resolve(rootDir, projectRoot);
    console.log("ⓘ  baseDir: ", baseDir);
    ensureFolderExists(baseDir);

    const techDir = path.join(baseDir, rootPath, tech);
    console.log("ⓘ  techDir: ", techDir);
    ensureFolderExists(techDir);

    const relativeProjectDir = projectRoot + "/" + rootPath + "/" + tech + "/" + projectName;
    console.log("ⓘ  relativeProjectDir: ", relativeProjectDir);

    const projectDir = path.join(baseDir, rootPath, tech, projectName);
    console.log("ⓘ  projectDir: ", projectDir);

    return { rootDir: rootDir, baseDir: baseDir, techDir: techDir, projectDir: projectDir, relativeProjectDir: relativeProjectDir, toolsDirTechno: toolsDirTechno }
}


export async function createFolderStructureAndReadmes({ basePath, folders, withReadmes = false }) {
    for (const folder of folders) {
        const folderPath = path.join(basePath, folder.name);
        ensureFolderExists(folderPath);
        if (withReadmes) {
            const readmePath = path.join(folderPath, "README.md");
            writeFileSync(readmePath, `${folder.readmeHeader}\n`, "utf-8");
        }
    }
}

export function sanitiseText({ text, capitalize }) {
    let underscoreonly = text.replace(/[_-]/g, " ")
    if (capitalize) {
        return underscoreonly.replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return underscoreonly
}

export function getFormattedDate() {
    const formattedDate = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).replace(',', '');
    return formattedDate;
}