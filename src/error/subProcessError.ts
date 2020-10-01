import { BuildError, ISerializedError } from './buildError';
import { deserializeError, registerDeserializer } from './deserializer';
import { serializeError } from './serializer';

interface ISerializedSubProcessError
{
  error?: ISerializedError;
  exitCode?: number;
  stderr?: string;
}

export class SubProcessError extends BuildError {
    static readonly ERROR_NAME = 'sub-process-error';

    static readonly ALL_ERROR_NAMES = new Set([
      SubProcessError.ERROR_NAME,
    ]);

    error?: Error;

    exitCode?: number;

    stdout?: string;

    stderr?: string;

    constructor({
      error, exitCode, stdout, stderr,
    }: {error?: Error, exitCode?: number, stdout?: string, stderr?: string}) {
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
      this.stdout = stdout;

      this.name = SubProcessError.ERROR_NAME;
    }

    serialize(): ISerializedError {
      return <ISerializedError<ISerializedSubProcessError>>{
        type: this.name,
        error: {
          error: (!this.error)
            ? undefined
            : serializeError(this.error),
          exitCode: this.exitCode,
          stderr: this.stderr,
        },
      };
    }

    toString(): string {
      let result = `${this.name}:\n`;

      if (typeof this.exitCode !== 'undefined') {
        result += `SubProcess exited with exit code '${this.exitCode}'`;
      }

      if (typeof this.error !== 'undefined') {
        result += 'SubProcess exited with error:\n';
        // todo: add indent utility function
        result += this.error.toString().replace(/\n/g, '\n\t');
        result += '\n';
      }

      if (typeof this.stderr !== 'undefined') {
        result += 'stderr output:\n';
        this.stderr.replace(/\n/g, '\n\t');
      }

      result += '\n';

      return result;
    }
}

registerDeserializer(SubProcessError.ERROR_NAME,
  (serialized: ISerializedSubProcessError) => new SubProcessError({
    error: (!serialized.error)
      ? undefined
      : deserializeError(serialized.error),
    exitCode: serialized.exitCode,
    stderr: serialized.stderr,
  }));
