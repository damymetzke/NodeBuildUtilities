#!/usr/bin/env node

import * as path from 'path';
import { LOGGER } from './log';
import { parse } from './clParser';
import * as config from './config';

async function main() {
  // eslint falsely flags this function even though a return statement would be unreachable
  // eslint-disable-next-line consistent-return
  const buildscriptfile = (() => {
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

  if ('configPath' in buildscriptfile && typeof buildscriptfile.configPath === 'string') {
    await config.loadConfig(buildscriptfile.configPath);
  }

  const args = parse(process.argv.slice(2))
    .option('target', 1);

  const [script] = args.positional;

  if (!script) {
    LOGGER.error('no script passed through cli');
    process.exit(1);
  }

  if (!('buildScripts' in buildscriptfile) || !(script in buildscriptfile.buildScripts)) {
    LOGGER.error(`script '${script}' not found!`);
    process.exit(1);
  }

  buildscriptfile.buildScripts[script]();
}

main();
