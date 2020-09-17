#!/usr/bin/env node

import * as path from 'path';
import { LOGGER } from './log';
import { parse } from './clParser';

interface IBuildScript
{
  buildScripts?: {[name: string]:()=>unknown};
  scriptDirectory?: string;
  scriptOutDirectory?: string;
}

function setupScriptDirectories(buildscriptFile: IBuildScript) {
  const scriptDirectory = (typeof buildscriptFile.scriptDirectory === 'undefined')
    ? buildscriptFile.scriptDirectory
    : 'script';

  const scriptOutDirectory = (typeof buildscriptFile.scriptDirectory === 'undefined')
    ? buildscriptFile.scriptDirectory
    : 'script';

  LOGGER.verbose(
    'Setting 2 directories:\n',
    `* scriptDirectory    = '${scriptDirectory}\n'`,
    `* scriptOutDirectory = '${scriptOutDirectory}'`,
  );
}

async function main() {
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

  setupScriptDirectories(buildscriptFile);

  if (typeof buildscriptFile.buildScripts === 'undefined' || !(script in buildscriptFile.buildScripts)) {
    LOGGER.error(`script '${script}' not found!`);
    process.exit(1);
  }

  buildscriptFile.buildScripts[script]();
}

main();
