import { runBin } from '../../scriptLoader';

// todo: parse and compile output
export async function scriptMain(projectFile = '.'): Promise<void> {
  await runBin(
    'tsc',
    [
      '-p',
      projectFile,
    ],
    {},
  );
}
