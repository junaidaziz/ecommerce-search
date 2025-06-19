const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(process.cwd(), '.env');
const examplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('Created .env from .env.example');
  } else {
    console.warn('No .env file found and .env.example is missing.');
    console.warn('Please create a .env file with a valid DATABASE_URL.');
    process.exit(0);
  }
}
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is missing in .env. Please set it for local development.');
}
