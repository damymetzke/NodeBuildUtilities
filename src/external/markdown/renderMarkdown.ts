import * as marked from 'marked';
import { promises as fs } from 'fs';
import * as path from 'path';
import { FileCallbackResult, walk, WalkOptions } from '../../fileSystem';

const REGEX_FILE_EXTENSION = /^(?<name>[^]*)\.[a-zA-Z]+$/;

export interface MarkdownOptions extends WalkOptions
{
  xHtml: boolean;
  style: string;
  githubFlavored: boolean;
}
type MarkDownOptionsExclusive = Pick<MarkdownOptions, 'xHtml' | 'style' | 'githubFlavored'>

const DEFAULT_OPTIONS: MarkDownOptionsExclusive = {
  xHtml: false,
  style: '',
  githubFlavored: true,
};

export async function scriptMain(sourceDirectory: string,
  outDirectory: string, options: Partial<MarkdownOptions>): Promise<void> {
  const resultingOptions: Partial<MarkdownOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  walk(sourceDirectory, outDirectory, async (sourcePath, fileName, outFolder) => {
    const data = await fs.readFile(sourcePath);
    const converted = marked(
      data.toString(),
      {
        gfm: resultingOptions.githubFlavored,
        xhtml: resultingOptions.xHtml,
      },
    );

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
