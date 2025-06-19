const fs = require('fs');
const path = require('path');

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

const envContent = fs.readFileSync(envPath, 'utf8');
if (!/DATABASE_URL\s*=/.test(envContent)) {
  console.warn('DATABASE_URL is missing in .env. Please set it for local development.');
}
