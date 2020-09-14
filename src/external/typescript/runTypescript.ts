import { runBin } from '../../scriptLoader';

// todo: parse and compile output
export function scriptMain(projectFile: string = '.') {
  runBin(
    'tsc',
    [
      '-p',
      projectFile,
    ],
    {},
  );
}
