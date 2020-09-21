#!/usr/bin/env node

import * as path from 'path';
import { promises as fs } from 'fs';
import { LOGGER } from './log';
import { parse } from './clParser';

import { runTypescript } from './external/typescript';
import { Config } from './config/index';
import { promiseResolves } from './util';
import { runBin } from './scriptLoader';

interface IBuildScript
{
  buildScripts?: {[name: string]:()=>unknown};
  scriptDirectory?: string;
  scriptOutDirectory?: string;
}

async function setupScriptDirectories(buildscriptFile: IBuildScript): Promise<void> {
  const scriptDirectory = (typeof buildscriptFile.scriptDirectory !== 'undefined')
    ? buildscriptFile.scriptDirectory
    : 'script';

  const scriptOutDirectory = (typeof buildscriptFile.scriptOutDirectory !== 'undefined')
    ? buildscriptFile.scriptOutDirectory
    : 'scriptOut';

  const scriptConfigDirectory = path.join(scriptOutDirectory, 'config');

  LOGGER.verbose(
    'Setting 2 directories:\n',
    `* scriptDirectory    = '${scriptDirectory}\n`,
    `* scriptOutDirectory = '${scriptOutDirectory}'`,
  );

  await fs.mkdir(scriptConfigDirectory, { recursive: true });
  const tsConfigPath = path.join(scriptConfigDirectory, 'tsconfig.json');
  const tsConfig = new Config(tsConfigPath);

  tsConfig.set<string[]>('include', [path.join(
    path.relative(scriptConfigDirectory, scriptDirectory),
    '**/*',
  )]);
  tsConfig.set<string[]>('exclude', ['node_modules', '**/*.spec.ts']);
  tsConfig.set<string>('compilerOptions.module', 'commonjs');
  tsConfig.set<string>('compilerOptions.target', 'ES2019');
  tsConfig.set<boolean>('compilerOptions.sourceMap', true);
  tsConfig.set<string>('compilerOptions.outDir', '../compiled');

  await tsConfig.save();

  await runTypescript(tsConfigPath);
}

async function main() {
  const typescriptBuildscriptPath = path.join(process.cwd(), 'buildscript.ts');
  if (await promiseResolves(fs.stat(typescriptBuildscriptPath))) {
    await runBin('tsc', [
      typescriptBuildscriptPath,
      '--target', 'ES2019',
      '--module', 'commonjs',
    ], {});
  }

  // eslint falsely flags this function even though a return statement would be unreachable
  // eslint-disable-next-line consistent-return
  const buildscriptFile: IBuildScript = (() => {
    try {
      // todo: wrap dynamic loader into a function
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(path.join(process.cwd(), 'buildscript.js'));
    } catch (error) {
      LOGGER.error('error loading buildscript.config.js:');
      LOGGER.error(error);
      process.exit(1);
    }
  })();

  const args = parse(process.argv.slice(2))
    .option('target', 1);

  const [script] = args.positional;

  if (!script) {
    LOGGER.error('no script passed through cli');
    process.exit(1);
  }

  await setupScriptDirectories(buildscriptFile);

  if (typeof buildscriptFile.buildScripts === 'undefined' || !(script in buildscriptFile.buildScripts)) {
    LOGGER.error(`script '${script}' not found!`);
    process.exit(1);
  }

  try {
    const result = await Promise.resolve(buildscriptFile.buildScripts[script]());
    if (typeof result === 'number' && result !== 0) {
      LOGGER.error(`script exited with exit code: '${result}'`);
      process.exit(result);
    }
    if (result instanceof Error) {
      LOGGER.error(`script exited with error:\n'${result.message}'`);
      process.exit(2);
    }
    // anything except for errors and numbers is silently ignored
    process.exit(0);
  } catch (error) {
    if (!(error instanceof Error)) {
      LOGGER.error('script has thrown an error, but it is not an instance of \'Error\'');
      process.exit(3);
    }

    LOGGER.error(`script has thrown an error:\n'${error.message}'`);
    process.exit(4);
  }
}

main();
