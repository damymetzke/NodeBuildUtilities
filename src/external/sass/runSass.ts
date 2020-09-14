import * as path from 'path';
import * as sass from 'sass';
import { promises as fs } from 'fs';
import { WalkOptions, walk, FileCallbackResult } from '../../fileSystem/walk';

const REGEX_RAW_EXTENSION = '^[a-zA-Z][a-zA-Z0-9_]*\\.s[ca]ss$';
const REGEX_EXTENSION = /^([a-zA-Z][a-zA-Z0-9_]*)\.s[ca]ss$/;

export type sassOptions = Omit<WalkOptions, 'test'>

export async function scriptMain(
  sourceDirectory: string,
  outputDirectory: string,
  options: Partial<sassOptions> = {},
): Promise<void> {
  walk(sourceDirectory, outputDirectory, async (
    sourcePath: string,
    fileName: string,
    outputFolder: string,
  ) : Promise<FileCallbackResult> => {
    const outputPath = path.join(
      outputFolder,
      fileName.replace(REGEX_EXTENSION, (_match, name) => `${name}.css`),
    );
    const rendered = sass.renderSync({
      file: sourcePath,
      outFile: outputPath,
    });

    await fs.mkdir(outputFolder, { recursive: true });
    await fs.writeFile(outputPath, rendered.css);

    return FileCallbackResult.FILE_HANDLED;
  }, {
    ...options,
    test: REGEX_RAW_EXTENSION,
  });
}
