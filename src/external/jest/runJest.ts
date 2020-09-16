import { pick } from 'lodash';
import { WalkOptions } from '../../fileSystem';
import { runBin } from '../../scriptLoader';

export interface JestOptions extends WalkOptions
{
    configFile: string
}
export type JestOptionsExclusive = Pick<JestOptions, 'configFile'>;

const DEFAULT_OPTIONS: JestOptionsExclusive = {
  configFile: '',
};

// todo: parse error output and generate errors
export async function scriptMain(options: Partial<JestOptions>): Promise<void> {
  const resultingOptions: JestOptionsExclusive & Partial<WalkOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  let jestArguments: string[] = [];
  if (resultingOptions.configFile !== '') {
    jestArguments = [
      '--config',
      resultingOptions.configFile,
    ];
  }
  runBin('jest', jestArguments, {});
}
