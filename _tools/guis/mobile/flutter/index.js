import { cl, cr } from "../../../common/logging";

export default async function ({ projectName, parentProjectDir }) {

    try {
        cl(`\nCreating Flutter project: ${projectName}...`);
        cl(`   The project is about to be created in this location ${parentProjectDir}`);
        cl("SOON...");
    } catch (error) {
        cr(error);
    }
}