import { runBin } from '../../scriptLoader';

export interface EslintOptions
{
    maxWarnings: number | undefined;
    ignoreWarnings: boolean;
}

const DEFAULT_OPTIONS: EslintOptions = {
  maxWarnings: undefined,
  ignoreWarnings: false,
};

// todo: parse output and generate errors
export async function scriptMain(source: string, options: Partial<EslintOptions>): Promise<void> {
  const resultingOptions: EslintOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const eslintArguments: string[] = [source];

  if (resultingOptions.ignoreWarnings) {
    eslintArguments.push('--quiet');
  } else if (typeof resultingOptions.maxWarnings !== 'undefined') {
    eslintArguments.push('--max-warnings');
    eslintArguments.push(String(resultingOptions.maxWarnings));
  }

  runBin('eslint', eslintArguments, {});
}
