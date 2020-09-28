import { BuildError, ISerializedError } from './buildError';
import { registerDeserializer } from './deserializer';

interface ISerializedUnknownError
{
  message: string
}

export class UnknownError extends BuildError {
    static readonly ERROR_NAME = 'unknown-error';

    static readonly ALL_ERROR_NAMES = new Set([
      UnknownError.ERROR_NAME,
    ])

    constructor(val: unknown) {
      super('recieved incorrect error string:\n'
      + `\t                 type:${typeof val}\n`
      + `\tstring representation: ${String(val)}`);

      this.name = UnknownError.ERROR_NAME;
    }

    serialize(): ISerializedError {
      return <ISerializedError<ISerializedUnknownError>>{
        type: UnknownError.ERROR_NAME,
        error: {
          message: this.message,
        },
      };
    }
}

registerDeserializer(UnknownError.ERROR_NAME, (serialized: ISerializedUnknownError) => {
  const result = new UnknownError(undefined);
  result.message = serialized.message;
  return result;
});
