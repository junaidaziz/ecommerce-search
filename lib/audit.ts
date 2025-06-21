import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'data', 'audit.log');

export function logAudit(action: string, details: Record<string, unknown> = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    details,
  };
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}
