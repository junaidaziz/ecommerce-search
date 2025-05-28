const { loadAndIndexProducts } = require('../lib/products');

async function generateIndex() {
    console.log("Starting index generation script...");
    try {
        await loadAndIndexProducts();
        console.log("Index generation complete.");
    } catch (error) {
        console.error("Error during index generation:", error);
        process.exit(1);
    }
}

generateIndex();

