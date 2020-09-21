export class SubProcessError extends Error {
    static ERROR_NAME = 'sub-process-error';

    static ALL_ERROR_NAMES = new Set([
      SubProcessError.ERROR_NAME,
    ]);

    error?: Error;

    exitCode?: number;

    stderr?: string;

    constructor({ error, exitCode, stderr }: {error?: Error, exitCode?: number, stderr?: string}) {
      if (typeof error !== 'undefined') {
        super(`Subprocess failed with error:\n${error.message}`);
      } else if (typeof exitCode !== 'undefined') {
        super(`Subprocess failed with exit code '${exitCode}'`);
      } else {
        super('Subprocess failed for unknown reasons');
      }
      this.error = error;
      this.exitCode = exitCode;
      this.stderr = stderr;

      this.name = SubProcessError.ERROR_NAME;
    }
}
