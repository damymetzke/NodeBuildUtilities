import * as path from 'path';
import { Config, validateConfig } from '../../config/index';
import { renderMarkdown } from './index';
import { MarkdownOptions } from './renderMarkdown';
import { MARKDOWN_VALIDATE } from './markdownConfigValidate';

export async function scriptMain(configPath: string): Promise<void> {
  const config = new Config(configPath, true);
  await config.load();

  const validateResult = validateConfig(config, MARKDOWN_VALIDATE);
  if (!validateResult.success) {
    throw new Error(`config file ${configPath} is invalid for markdown`);
  }

  const output = config.get<string>('output');
  const options = config.get<Partial<MarkdownOptions>>('options');

  const resultingOptions: Partial<MarkdownOptions> = {};

  Object.entries(options).forEach(([key, value]: [string, unknown]) => {
    if (key !== 'styleSheet') {
      // todo: figure out how to properly type this
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (<any>resultingOptions)[key] = value;
    }

    resultingOptions.styleSheet = path.join(path.dirname(configPath), <string>value);
  });

  await Promise.all(config.get<string[]>('input').map((input) => renderMarkdown(
    path.join(path.dirname(configPath), input),
    path.join(path.dirname(configPath), output),
    resultingOptions,
  )));
}
