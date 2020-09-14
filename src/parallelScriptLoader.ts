import { LOGGER } from './log';

if (!process.send) {
  LOGGER.error('process is not a valid child_process');
  process.exit(1);
}

process.once('message', async (data: { scriptPath: string; args: unknown[]; }) => {
  const { scriptPath, args } = data;
  // todo: wrap dynamic import in function
  // eslint-disable-next-line max-len
  // eslint-disable-next-line global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires
  const script = require(scriptPath);
  const mainExists = (typeof script.scriptMain === 'function');

  if (args.length > 0 && !mainExists) {
    if (process.send) {
      process.send({
        type: 'reject',
        message: 'arguments passed but no scriptMain defined',
      });
    }
    return;
  }

  if (!mainExists) {
    if (process.send) {
      process.send({
        type: 'resolve',
        result: undefined,
      });
    }
    return;
  }

  try {
    const result = script.scriptMain(...args);
    if (process.send) {
      if (!(result instanceof Promise)) {
        process.send({
          type: 'resolve',
          result,
        });
      }

      const resolvedResult = await result;
      process.send({
        type: 'resolve',
        result: resolvedResult,
      });
    }
  } catch (error) {
    if (process.send) {
      process.send({
        type: 'reject',
        message: String(error),
      });
    }
  }
});
