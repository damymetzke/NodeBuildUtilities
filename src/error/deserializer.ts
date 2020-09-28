import { BuildError, IDefaultSerializedError, ISerializedError } from './buildError';

// todo: currently error stack traces are ignored during serialization

// bug: eslin error, this should net be seen as a function
// this needs to be any since implementations should already know the type
// eslint-disable-next-line func-call-spacing, no-spaced-func, @typescript-eslint/no-explicit-any
const deserializers = new Map<string, (serialized: any)=>Error>([
  ['eval-error', (serialized: IDefaultSerializedError) => new EvalError(serialized.message)],
  ['range-error', (serialized: IDefaultSerializedError) => new RangeError(serialized.message)],
  ['reference-error', (serialized: IDefaultSerializedError) => new ReferenceError(serialized.message)],
  ['syntax-error', (serialized: IDefaultSerializedError) => new SyntaxError(serialized.message)],
  ['type-error', (serialized: IDefaultSerializedError) => new TypeError(serialized.message)],
  ['uri-error', (serialized: IDefaultSerializedError) => new URIError(serialized.message)],
  ['error', (serialized: IDefaultSerializedError) => new Error(serialized.message)],
]);

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
