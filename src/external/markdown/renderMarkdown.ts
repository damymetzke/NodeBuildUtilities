import * as marked from 'marked';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as sass from 'sass';
import { FileCallbackResult, walk, WalkOptions } from '../../fileSystem';

const REGEX_FILE_EXTENSION = /^(?<name>[^]*)\.[a-zA-Z]+$/;
const REGEX_STYLE_SHEET_IS_SASS = /\.s[ca]ss$/;
const REGEX_STYLE_SHEET_IS_CSS = /\.css$/;

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
      <div id="gen--content">
        ${content}
      </div>
    </body>
    </html>
  `;
}

export interface MarkdownOptions extends WalkOptions
{
  xHtml: boolean;
  styleSheet: string;
  githubFlavored: boolean;
  title: string | ((fileName: string)=>string);
}
type MarkDownOptionsExclusive = Pick<MarkdownOptions, 'xHtml' | 'styleSheet' | 'githubFlavored' | 'title'>

const DEFAULT_OPTIONS: MarkDownOptionsExclusive = {
  xHtml: false,
  styleSheet: '',
  githubFlavored: true,
  title: (fileName) => fileName.replace(REGEX_FILE_EXTENSION,
    (_match, _0, _offset, _string, groups) => groups.name),
};

async function setupStyleSheet(outDirectory: string, sourceFile: string): Promise<void> {
  if (REGEX_STYLE_SHEET_IS_CSS.test(sourceFile)) {
    await fs.mkdir(outDirectory, { recursive: true });
    await fs.copyFile(sourceFile, path.join(outDirectory, 'style.css'));
    return;
  }
  if (REGEX_STYLE_SHEET_IS_SASS.test(sourceFile)) {
    const result = sass.renderSync({ file: sourceFile, outputStyle: 'compressed' });
    await fs.writeFile(path.join(outDirectory, 'style.css'), result.css);
    return;
  }

  throw new Error(`stylesheet ${sourceFile} is not of type css or sass`);
}

export async function scriptMain(sourceDirectory: string,
  outDirectory: string, options: Partial<MarkdownOptions>): Promise<void> {
  const resultingOptions: MarkDownOptionsExclusive & Partial<WalkOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (resultingOptions.styleSheet !== '') {
    setupStyleSheet(outDirectory, resultingOptions.styleSheet);
  }

  await walk(sourceDirectory, outDirectory, async (sourcePath, fileName, outFolder) => {
    const pathToRoot = path.relative(outFolder, outDirectory);
    const styleSheetPath = path.join(pathToRoot, 'style.css');

    const title = typeof resultingOptions.title === 'string'
      ? resultingOptions.title
      : resultingOptions.title(fileName);

    const data = await fs.readFile(sourcePath);
    const converted = marked(
      data.toString(),
      {
        gfm: resultingOptions.githubFlavored,
        xhtml: resultingOptions.xHtml,
      },
    );

    const htmlOutput = (resultingOptions.styleSheet === '')
      ? makeHtml(converted, title)
      : makeHtml(converted, title, styleSheetPath);

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
