import { promises as fs } from "fs";
import * as path from "path";
import * as _ from "lodash";

import { walk as walk_alt, FileCallbackResult, WalkOptions, WalkResult } from "./walk";
import { promiseResolves } from "../util/promises";

export interface CopyFolderOptions extends WalkOptions
{
    overrideExisting: boolean;
};

export type CopyFolderResult = WalkResult;

const DEFAULT_OPTIONS: CopyFolderOptions = {
    overrideExisting: true,
    subFolder: "",
    test: undefined,
    singleFolder: false,
    maxDepth: undefined
};

export async function scriptMain(sourceDir: string, targetDir: string, options: Partial<CopyFolderOptions> = {}): Promise<CopyFolderResult>
{
    const resultingOptions: CopyFolderOptions = { ...DEFAULT_OPTIONS, ...options };

    // const filesCopied = await walk(sourceDir, targetDir, resultingOptions);
    const result = walk_alt(
        sourceDir,
        targetDir,
        async (sourcePath, fileName, outputFolder) =>
        {
            const outputPath = path.join(outputFolder, fileName);
            if (!resultingOptions.overrideExisting)
            {
                if (await promiseResolves(fs.stat(outputPath)))
                {
                    return FileCallbackResult.FILE_IGNORED;
                }
            }

            await fs.mkdir(outputFolder, { recursive: true });

            await fs.copyFile(sourcePath, outputPath);

            return FileCallbackResult.FILE_HANDLED;
        },
        resultingOptions
    );

    return result;
}