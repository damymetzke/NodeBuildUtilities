import { BuildError, ISerializedError } from './buildError';

export function serializeError(error: Error): ISerializedError {
  if (error instanceof BuildError) {
    return error.serialize();
  }

  if (error instanceof EvalError) {
    return {
      type: 'eval-error',
      error: { message: error.message },
    };
  }
  if (error instanceof RangeError) {
    return {
      type: 'range-error',
      error: { message: error.message },
    };
  }
  if (error instanceof ReferenceError) {
    return {
      type: 'reference-error',
      error: { message: error.message },
    };
  }
  if (error instanceof SyntaxError) {
    return {
      type: 'syntax-error',
      error: { message: error.message },
    };
  }
  if (error instanceof TypeError) {
    return {
      type: 'type-error',
      error: { message: error.message },
    };
  }
  if (error instanceof URIError) {
    return {
      type: 'uri-error',
      error: { message: error.message },
    };
  }

  return {
    type: 'error',
    error: { message: error.message },
  };
}
