import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const cwd = process.cwd();
const envPath = path.join(cwd, '.env');
const exampleEnvPath = path.join(cwd, '.env.example');

const resolvedPath = fs.existsSync(envPath)
  ? envPath
  : (fs.existsSync(exampleEnvPath) ? exampleEnvPath : null);

if (resolvedPath) {
  dotenv.config({ path: resolvedPath });
}
