import { scriptMain as copyFolder, CopyFolderOptions, CopyFolderResult } from "./copyFolder";
import { runParallelScript } from "../../scriptLoader";

export async function scriptMain(sourceTargetPairs: [ string, string ][], options: Partial<CopyFolderOptions>): Promise<CopyFolderResult>
{
    const result: CopyFolderResult[] = await Promise.all(
        sourceTargetPairs.map(([ source, target ]) => runParallelScript("std:fileSystem/copyFolder.js", source, target, options))
    );

    return result.reduce((total, current) =>
    {
        return {
            foldersWalked: total.foldersWalked + current.foldersWalked,
            maxDepth: Math.max(total.maxDepth, current.maxDepth)
        };
    },
        <CopyFolderResult>{
            foldersWalked: 0,
            maxDepth: -1
        });
}