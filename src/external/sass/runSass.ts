import * as path from 'path';
import * as sass from 'sass';
import { promises as fs } from 'fs';
import { WalkOptions, walk, FileCallbackResult } from '../../fileSystem/walk';

const REGEX_RAW_EXTENSION = '^[a-zA-Z][a-zA-Z0-9_]*\\.s[ca]ss$';
const REGEX_EXTENSION = /^([a-zA-Z][a-zA-Z0-9_]*)\.s[ca]ss$/;

export interface SassOptions extends Omit<WalkOptions, 'test'>
{
    sourceMap: boolean;
    outputStyle: 'expanded' | 'compressed'
}

const OPTIONS_DEFAULT: Pick<SassOptions, 'sourceMap' | 'outputStyle'> = {
  sourceMap: false,
  outputStyle: 'expanded',
};

export async function scriptMain(
  sourceDirectory: string,
  outputDirectory: string,
  options: Partial<SassOptions> = {},
): Promise<void> {
  const resultingOptions:
    Partial<Omit<SassOptions, 'sourceMap'>>
    & Pick<SassOptions, 'sourceMap'> = {
      ...OPTIONS_DEFAULT,
      ...options,
    };

  walk(sourceDirectory, outputDirectory, async (
    sourcePath: string,
    fileName: string,
    outputFolder: string,
  ) : Promise<FileCallbackResult> => {
    const outputPath = path.join(
      outputFolder,
      fileName.replace(REGEX_EXTENSION, (_match, name) => `${name}.css`),
    );
    const outputMapPath = path.join(
      outputFolder,
      fileName.replace(REGEX_EXTENSION, (_match, name) => `${name}.css.map`),
    );
    const rendered = sass.renderSync({
      file: sourcePath,
      outFile: outputPath,
      sourceMap: resultingOptions.sourceMap,
      outputStyle: resultingOptions.outputStyle,
    });

    await fs.mkdir(outputFolder, { recursive: true });
    const outFileResults = [fs.writeFile(outputPath, rendered.css)];
    if (resultingOptions.sourceMap) {
      outFileResults.push(fs.writeFile(outputMapPath, <Buffer>rendered.map));
    }

    return FileCallbackResult.FILE_HANDLED;
  }, {
    ...resultingOptions,
    test: REGEX_RAW_EXTENSION,
  });
}
