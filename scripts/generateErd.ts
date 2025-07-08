import dotenv from 'dotenv';

dotenv.config();

import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';


async function main() {
  const token = process.env.BROWSERLESS_API_TOKEN;
  if (!token) {
    console.error('BROWSERLESS_API_TOKEN env variable is missing');
    process.exit(1);
  }

  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const schema = await readFile(schemaPath, 'utf8');

  const response = await fetch('https://kroki.io/mermaid/png', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      Authorization: `Bearer ${token}`,
    },
    body: schema,
  });

  if (!response.ok) {
    console.error('Failed to generate ERD:', await response.text());
    process.exit(1);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const outputDir = path.join(process.cwd(), 'docs');
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'ERD.png');
  await writeFile(outputPath, buffer);
  console.log('Generated', outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
