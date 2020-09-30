import { fork, exec } from 'child_process';
import * as path from 'path';
import { BuildError, SubProcessError } from './error';
import { ConvertReturn } from './script/convertReturn';

const REGEX_NAMESPACE_SCRIPT = /^(\w+):([^ \n\t]+)$/;
const REGEX_ADD_EXTENSION = /^([^ \n\t]+?)(?:.js)?$/;

function parseScript(script: string): string {
  return script
    // parse namespaces
    .replace(REGEX_NAMESPACE_SCRIPT, (_match, namespace, scriptPath) => {
      switch (namespace) {
        case 'std':
          return path.join(__dirname, scriptPath);
        default:
          return scriptPath;
      }
    })
    .replace(REGEX_ADD_EXTENSION, (_match, scriptPath) => `${scriptPath}.js`); // add js if it doesn't exist
}

export async function runScriptSync(scriptPath: string, ...args: unknown[]): Promise<void> {
  const filePath = parseScript(scriptPath);

  let result: void | SubProcessError;
  try {
    result = await (async () => {
      // todo: wrap dynamic import in function
      // eslint-disable-next-line max-len
      // eslint-disable-next-line global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires
      const { scriptMain } = require(filePath);
      if (!scriptMain) {
        throw new Error(`Script ${filePath} does not define scriptMain`);
      }
      if (typeof scriptMain !== 'function') {
        throw new Error(`Script ${filePath} defines scriptMain, but it is not a function`);
      }

      return ConvertReturn(() => scriptMain(...args));
    })();
  } catch (error) {
    throw new Error(`Script ${filePath} not found`);
  }

  if (typeof result !== 'undefined') {
    throw result;
  }
}

export async function runScript(scriptPath: string, ...args: unknown[]): Promise<unknown> {
  return runScriptSync(scriptPath, ...args);
}

export function runParallelScript(scriptPath: string, ...args: unknown[]): Promise<unknown> {
  return new Promise<unknown>((resolve, reject) => {
    const filePath = parseScript(scriptPath);

    const child = fork(path.join(__dirname, 'parallelScriptLoader.js'));

    // todo: create custom type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    child.on('message', (message: any) => {
      switch (message.type) {
        case 'reject':
          reject(message.message);
          break;
        case 'resolve':
          resolve(message.result);
          break;
        default:
          reject(new Error('invalid response from parallelScriptLoader'));
      }
    });

    child.send({
      scriptPath: filePath,
      args,
    });
  });
}

export function runNpm(scriptName: string, npmRoot?: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const cwd = npmRoot || process.cwd();
    exec(`npm run ${scriptName}`, {
      cwd,
    }, (error) => {
      if (error) {
        reject(new SubProcessError(
          {
            error: new BuildError(error.message),
            stderr: error.cmd,
            exitCode: error.code,
          },
        ));
      }
      resolve();
    });
  });
}

export type ShellOptions =
    {
        cwd: string;
    };

export function runShell(
  program: string,
  args: string[],
  options: Partial<ShellOptions>,
): Promise<void> {
  // build default inside function in case the cwd changes
  const defaultShellOptions: ShellOptions = {
    cwd: process.cwd(),
  };

  const resultingOptions = {
    ...defaultShellOptions,
    ...options,
  };

  return new Promise<void>(
    (resolve, reject) => {
      exec(
        `${program}${args.reduce((total, current) => `${total} "${current}"`, '')}`,
        {
          cwd: resultingOptions.cwd,
        },
        (error) => {
          if (error) {
            reject(new SubProcessError(
              {
                error: new BuildError(error.message),
                stderr: error.cmd,
                exitCode: error.code,
              },
            ));
          }

          resolve();
        },
      );
    },
  );
}

export function runBin(
  program: string,
  args: string[],
  options: Partial<ShellOptions>,
): Promise<void> {
  return runShell(`${
    path.join('node_modules/.bin', program)
  }`, args, options);
}

export async function runBuildScript(script: string): Promise<unknown> {
  // todo: wrap dynamic import in function
  // eslint-disable-next-line max-len
  // eslint-disable-next-line global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires
  const buildscriptfile = require(path.join(process.cwd(), 'buildscript.config.js'));
  if (!('buildScripts' in buildscriptfile) || !(script in buildscriptfile.buildScripts)) {
    throw new Error(`script '${script}' not found!`);
  }

  return buildscriptfile.buildScripts[script]();
}

export function runBuildScriptParallel(script: string): Promise<void> {
  return runShell('node', [path.join(__dirname, 'buildScript.js'), script], {});
}
