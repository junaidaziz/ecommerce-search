const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const root = process.cwd();
const envPath = path.join(root, '.env');
const gitignorePath = path.join(root, '.gitignore');
const prismaDir = path.join(root, 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');
const migrationsDir = path.join(prismaDir, 'migrations');
const hashPath = path.join(prismaDir, '.schema_hash');

// Ensure DATABASE_URL exists and looks like a postgres connection string
if (!fs.existsSync(envPath)) {
  console.warn('.env not found. Prisma migrations skipped.');
  process.exit(0);
}
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/^DATABASE_URL\s*=\s*(.+)$/m);
if (!match) {
  console.warn('DATABASE_URL missing in .env');
  process.exit(0);
}
const url = match[1].trim().replace(/^"|"$/g, '');
if (!/^postgres/.test(url)) {
  console.warn('DATABASE_URL is not a postgres connection string in .env');
  process.exit(0);
}

// Ensure prisma/migrations is not ignored in .gitignore
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  const lines = gitignore.split(/\r?\n/);
  const filtered = lines.filter((line) => line.trim() !== 'prisma/migrations');
  if (lines.length !== filtered.length) {
    fs.writeFileSync(gitignorePath, filtered.join('\n'));
    console.log('Removed prisma/migrations from .gitignore');
  }
}

function hashFile(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

if (!fs.existsSync(schemaPath)) {
  console.warn('schema.prisma not found.');
  process.exit(0);
}

const currentHash = hashFile(schemaPath);
let previousHash = null;
if (fs.existsSync(hashPath)) {
  previousHash = fs.readFileSync(hashPath, 'utf8').trim();
}
const migrationsMissing =
  !fs.existsSync(migrationsDir) || fs.readdirSync(migrationsDir).length === 0;
const schemaChanged = currentHash !== previousHash;

if (migrationsMissing || schemaChanged) {
  console.log('Generating Prisma migration...');
  execSync('npx prisma migrate dev --name init --skip-seed', {
    stdio: 'inherit',
  });
  fs.writeFileSync(hashPath, currentHash);
  try {
    execSync('git add prisma/migrations');
    execSync(
      'git commit -m "chore(migrations): auto-generated initial migration"'
    );
    console.log('Committed Prisma migrations');
  } catch (err) {
    console.warn('Failed to commit migrations:', err.message);
  }
}
