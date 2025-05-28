import { forceBuildAndSaveIndexToBlob } from '../lib/products.js'; // Import the new function

async function generateIndex() {
    console.log("Starting index generation script...");
    try {
        await forceBuildAndSaveIndexToBlob(); // Call the function that only builds and uploads
        console.log("Index generation complete.");
    } catch (error) {
        console.error("Error during index generation:", error);
        process.exit(1);
    }
}

generateIndex();
