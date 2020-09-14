import { Config, validateConfig } from '../../config/index';
import { runSass } from './index';
import { SassOptions } from './runSass';
import { SASS_VALIDATE } from './sassConfigValidate';

export async function scriptMain(configPath: string): Promise<void> {
  const config = new Config(configPath, true);
  await config.load();

  const validateResult = validateConfig(config, SASS_VALIDATE);
  if (!validateResult.success) {
    throw new Error(`config file ${configPath} is invalid for sass`);
  }
  const output = config.get<string>('output');
  const options = config.get<Partial<SassOptions>>('options');

  await Promise.all(config.get<string[]>('input').map((input) => runSass(input, output, options)));
}
