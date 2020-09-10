import { promises as fs } from 'fs';

export async function scriptMain(sources: string[]): Promise<void> {
  await Promise.all(sources.map((source) => fs.rmdir(source, { recursive: true })));
}
