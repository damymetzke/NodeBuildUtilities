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

  await Promise.all(config.get<string[]>('input').map((input) => renderMarkdown(input, output, options)));
}
