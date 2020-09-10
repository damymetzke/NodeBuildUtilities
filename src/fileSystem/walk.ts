import { promises as fs } from 'fs';
import * as path from 'path';

export interface WalkOptions
{
    subFolder: string;
    test?: string;
    singleFolder: boolean;
    maxDepth?: number;
}

export interface WalkResult
{
    foldersWalked: number;
    maxDepth: number;
}

export enum FileCallbackResult
{
    FILE_HANDLED,
    FILE_IGNORED
}

export type FileCallback = (
    sourcePath: string,
    fileName: string,
    outputFolder: string) => Promise<FileCallbackResult>;

const DEFAULT_WALK_OPTIONS: WalkOptions = {
  subFolder: '',
  test: undefined,
  singleFolder: false,
  maxDepth: undefined,
};

async function walkImplementation(
  sourceDirectory: string,
  outputDirectory: string,
  callback: FileCallback,
  options: WalkOptions,
  depth: number,
): Promise<WalkResult> {
  const sources = await fs.readdir(sourceDirectory);

  const results: WalkResult[] = await Promise.all(sources
    .map(async (source) => {
      const sourcePath = path.join(sourceDirectory, source);
      const outputPath = path.join(outputDirectory, options.subFolder);

      const sourceStat = await fs.stat(sourcePath);

      if (sourceStat.isDirectory()) {
        return walkImplementation(
          sourcePath,
          options.singleFolder ? outputDirectory : path.join(outputDirectory, source),
          callback,
          options,
          depth + 1,
        );
      }

      if (options.test && !RegExp(options.test).test(source)) {
        return {
          foldersWalked: 0,
          maxDepth: -1,
        };
      }

      if (await callback(sourcePath, source, outputPath) === FileCallbackResult.FILE_IGNORED) {
        return {
          foldersWalked: 0,
          maxDepth: -1,
        };
      }

      return {
        foldersWalked: 0,
        maxDepth: depth,
      };
    }));

  const result = results.reduce((total: WalkResult, current: WalkResult) => ({
    foldersWalked: total.foldersWalked + current.foldersWalked,
    maxDepth: Math.max(total.maxDepth, current.maxDepth),
  }),
  {
    foldersWalked: 1,
    maxDepth: -1,
  });

  if (result.maxDepth === -1) {
    return {
      foldersWalked: 0,
      maxDepth: -1,
    };
  }

  return result;
}

export function walk(
  sourceDirectory: string,
  outputDirectory: string,
  callback: FileCallback,
  options: Partial<WalkOptions>,
): Promise<WalkResult> {
  const resultingOptions = {
    ...DEFAULT_WALK_OPTIONS,
    ...options,
  };

  return walkImplementation(sourceDirectory, outputDirectory, callback, resultingOptions, 0);
}
