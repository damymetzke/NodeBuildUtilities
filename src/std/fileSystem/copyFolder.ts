import { promises as fs } from "fs";
import * as path from "path";
import * as _ from "lodash";

export type CopyFolderOptions = {
    subFolder: string;
    overrideExisting: boolean;
};

export type CopyFolderResult = {
    filesCopied: number;
};

const DEFAULT_OPTIONS: CopyFolderOptions = {
    subFolder: "",
    overrideExisting: true
};

async function walk(sourceDir: string, targetDir: string, options: CopyFolderOptions): Promise<number>
{
    const files = await fs.readdir(sourceDir);

    let folderCreated = false;

    const fileResults = await Promise.all(files.map(async (file) =>
    {
        const filePath = path.join(sourceDir, file);
        const fileStat = await fs.stat(filePath);
        if (fileStat.isDirectory())
        {
            const newTargetDirectory = path.join(targetDir, file);
            return walk(filePath, newTargetDirectory, options);
        }

        if (!folderCreated)
        {
            await fs.mkdir(path.join(targetDir, options.subFolder), { recursive: true });
            folderCreated = true;
        }
        const fileTarget = path.join(targetDir, options.subFolder, file);

        if (!options.overrideExisting)
        {
            if (await new Promise((resolve) =>
            {
                //this function turns the resolve/reject result into a boolean (resolve=true, reject=false).
                fs.stat(fileTarget)
                    .then(() =>
                    {
                        resolve(true);
                    })
                    .catch(() =>
                    {
                        resolve(false);
                    });
            }))
            {
                return 0;
            }
        }

        await fs.copyFile(filePath, fileTarget);

        return 1;
    }));

    return _.sum(fileResults);
}

export async function scriptMain(sourceDir: string, targetDir: string, options: Partial<CopyFolderOptions> = {}): Promise<CopyFolderResult>
{
    const resultingOptions: CopyFolderOptions = { ...DEFAULT_OPTIONS, ...options };

    const filesCopied = await walk(sourceDir, targetDir, resultingOptions);

    return {
        filesCopied: filesCopied
    };
}