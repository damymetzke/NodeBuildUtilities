import { BuildError, ISerializedError } from './buildError';

// bug: eslin error, this should net be seen as a function
// this needs to be any since implementations should already know the type
// eslint-disable-next-line func-call-spacing, no-spaced-func, @typescript-eslint/no-explicit-any
const deserializers = new Map<string, (serialized: any)=>Error>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerDeserializer(type: string, deserializer: (serialized: any)=>Error): void {
  deserializers.set(type, deserializer);
}

export function deserializeError(serialized: ISerializedError): Error {
  const deserializer = deserializers.get(serialized.type);
  if (typeof deserializer === 'undefined') {
    throw new BuildError(`deserializer for type '${serialized.type}' not defined`);
  }

  return deserializer(serialized.error);
}
