import * as marked from 'marked';
import { promises as fs } from 'fs';
import * as path from 'path';
import { FileCallbackResult, walk, WalkOptions } from '../../fileSystem';

const REGEX_FILE_EXTENSION = /^(?<name>[^]*)\.[a-zA-Z]+$/;

function makeHtml(content: string, title: string, styleSheet?: string) {
  const styleSheetElement = (typeof styleSheet === 'undefined')
    ? ''
    : `<link rel="stylesheet" href="${styleSheet}">`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${styleSheetElement}
    </head>
    <body>
        ${content}
    </body>
    </html>
  `;
}

export interface MarkdownOptions extends WalkOptions
{
  xHtml: boolean;
  styleSheet: string;
  githubFlavored: boolean;
}
type MarkDownOptionsExclusive = Pick<MarkdownOptions, 'xHtml' | 'styleSheet' | 'githubFlavored'>

const DEFAULT_OPTIONS: MarkDownOptionsExclusive = {
  xHtml: false,
  styleSheet: '',
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

    const htmlOutput = makeHtml(converted, fileName);

    await fs.mkdir(outFolder, { recursive: true });
    await fs.writeFile(
      path.join(outFolder,
        fileName.replace(REGEX_FILE_EXTENSION, (_match, _0, _offset, _string, groups) => `${groups.name}.html`)),
      htmlOutput,
    );
    return FileCallbackResult.FILE_HANDLED;
  },
  resultingOptions);
}
