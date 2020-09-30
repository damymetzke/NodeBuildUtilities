import { SubProcessError, UnknownError } from '../error';

export async function ConvertReturn(
  internal: ()=>unknown,
): Promise<SubProcessError | void> {
  try {
    const result = await Promise.resolve(internal());

    if (result instanceof SubProcessError) {
      return result;
    }
    if (result instanceof Error) {
      return new SubProcessError({ error: result });
    }

    if (typeof result === 'number' && result !== 0) {
      return new SubProcessError({ exitCode: result });
    }
  } catch (error) {
    if (error instanceof SubProcessError) {
      return error;
    }
    if (error instanceof Error) {
      return new SubProcessError({ error });
    }

    return new SubProcessError({ error: new UnknownError(error) });
  }
}
