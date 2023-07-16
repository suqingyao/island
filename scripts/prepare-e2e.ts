import path from 'path';
import fs from 'fs-extra';
import * as execa from 'execa';

const exampleDir = path.join(__dirname, '../e2e/playground/basic');

const ROOT = path.join(__dirname, '..');

const defaultOptions = {
  stdout: process.stdout,
  stdin: process.stdin,
  stderr: process.stderr
};

async function prepareE2E() {
  if (!fs.existsSync(path.resolve(__dirname, '../dist'))) {
    execa.commandSync('pnpm build', {
      cwd: ROOT,
      ...defaultOptions
    });
  }

  execa.commandSync('npx playwright install', {
    cwd: ROOT,
    ...defaultOptions
  });

  execa.commandSync('pnpm dev', {
    cwd: exampleDir,
    ...defaultOptions
  });
}

prepareE2E();
