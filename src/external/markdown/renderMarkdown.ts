import * as marked from 'marked';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as sass from 'sass';
import { highlightAuto } from 'highlight.js';
import * as yaml from 'yaml';
import { FileCallbackResult, walk, WalkOptions } from '../../fileSystem';

const REGEX_FILE_EXTENSION = /^(?<name>[^]*)\.[a-zA-Z]+$/;
const REGEX_STYLE_SHEET_IS_SASS = /\.s[ca]ss$/;
const REGEX_STYLE_SHEET_IS_CSS = /\.css$/;
const REGEX_LINK_TO_MARKDOWN = /^(?<file>[^]+)\.md$/;
const REGEX_YAML_HEADER = /^\w*---(?<header>[^]*?)---/;

function setupLinkRenderer() {
  // bug: marked definitions expect whole renderer, but can actually be partial.
  const renderer = <marked.Renderer>{
    link(href:string, title:string, text:string) {
      const resultingHref = href.replace(REGEX_LINK_TO_MARKDOWN, (_match, _p0, _offset, _string, groups: {file: string}) => `${groups.file}.html`);
      return `<a href="${resultingHref}" title="${title}">${text}</a>`;
    },
  };

  marked.use({ renderer });
}

function makeHtml(content: string, title: string, contentClass: string, styleSheet?: string) {
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
      <div id="gen--content" class="${contentClass}">
        ${content}
      </div>
    </body>
    </html>
  `;
}

function onHighlight(code: string, lang: string): string | void {
  const result = highlightAuto(code, [lang]);
  if (result.errorRaised instanceof Error) {
    throw result.errorRaised;
  }

  return result.value;
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
  setupLinkRenderer();
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

    let title = typeof resultingOptions.title === 'string'
      ? resultingOptions.title
      : resultingOptions.title(fileName);

    let contentClass = '';

    const data = await fs.readFile(sourcePath);
    const dataWithoutHeader = data.toString()
      .replace(REGEX_YAML_HEADER, (_match, _p0, _offset, _string, groups: {header: string}) => {
        const headerData = yaml.parse(groups.header);
        if (typeof headerData.title === 'string') {
          title = headerData.title;
        }
        if (typeof headerData.class === 'string') {
          contentClass = headerData.class;
        }
        return '';
      });
    const converted = marked(
      dataWithoutHeader,
      {
        gfm: resultingOptions.githubFlavored,
        xhtml: resultingOptions.xHtml,
        highlight: onHighlight,
      },
    );

    const htmlOutput = (resultingOptions.styleSheet === '')
      ? makeHtml(converted, title, contentClass)
      : makeHtml(converted, title, contentClass, styleSheetPath);

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
