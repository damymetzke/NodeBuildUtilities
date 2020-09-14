import * as _ from 'lodash';
import {
  runScript, runParallelScript, runNpm, ShellOptions, runShell, runBuildScript,
} from './scriptLoader';
import { runBin, runBuildScriptParallel } from '.';

export function bindScript(scriptPath: string, ...args: unknown[]): () => Promise<unknown> {
  return _.bind(
    runScript, null,
    scriptPath,
    ...args,
  );
}

export function bindParallelScript(scriptPath: string, ...args: unknown[]): () => Promise<unknown> {
  return _.bind(
    runParallelScript, null,
    scriptPath,
    ...args,
  );
}

export function bindNpm(scriptName: string, npmRoot?: string): () => Promise<void> {
  return _.bind(
    runNpm, null,
    scriptName,
    npmRoot,
  );
}

export function bindShell(
  program: string,
  args: string[],
  options: Partial<ShellOptions>,
): () => Promise<void> {
  return _.bind(
    runShell, null,
    program,

    args, options,
  );
}

export function bindBin(
  program: string,
  args: string[],
  options: Partial<ShellOptions>,
): () => Promise<void> {
  return _.bind(
    runBin, null,
    program,

    args, options,
  );
}

export function bindBuildScript(script: string): () => Promise<unknown> {
  return _.bind(
    runBuildScript, null,
    script,
  );
}

export function bindBuildScriptParallel(script: string): () => Promise<unknown> {
  return _.bind(
    runBuildScriptParallel, null,
    script,
  );
}
