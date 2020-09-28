import { registerDeserializer } from './deserializer';

export interface IDefaultSerializedError{
    message: string;
}

export interface ISerializedError<T = unknown>
{
    type: string;
    error: T;
}

export class BuildError extends Error {
  constructor(message: string, type = 'build-error') {
    super(message);
    this.name = type;
  }

  serialize(): ISerializedError {
    return <ISerializedError<IDefaultSerializedError>>{
      type: this.name,
      error: {
        message: this.message,
      },
    };
  }
}

registerDeserializer('build-error', (serialized: IDefaultSerializedError) => new BuildError(serialized.message));
