import * as marked from 'marked';
import { promises as fs } from 'fs';
import * as path from 'path';
import { FileCallbackResult, walk, WalkOptions } from '../../fileSystem';

const REGEX_FILE_EXTENSION = /^(?<name>[^]*)\.[a-zA-Z]+$/;

export type MarkdownOptions = WalkOptions;
type MarkDownOptionsExclusive = Pick<MarkdownOptions, 'test'>

const DEFAULT_OPTIONS: MarkDownOptionsExclusive = {
  test: '[^]*',
};

export async function scriptMain(sourceDirectory: string,
  outDirectory: string, options: Partial<MarkdownOptions>): Promise<void> {
  const resultingOptions: MarkDownOptionsExclusive = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  walk(sourceDirectory, outDirectory, async (sourcePath, fileName, outFolder) => {
    const data = await fs.readFile(sourcePath);
    const converted = marked(data.toString());
    await fs.mkdir(outFolder, { recursive: true });
    await fs.writeFile(
      path.join(outFolder,
        fileName.replace(REGEX_FILE_EXTENSION, (_match, _0, _offset, _string, groups) => `${groups.name}.html`)),
      converted,
    );
    return FileCallbackResult.FILE_HANDLED;
  },
  resultingOptions);
}
