import { serializeError, SubProcessError } from './error';
import { LOGGER } from './log';
import { ConvertReturn } from './script';

if (!process.send) {
  LOGGER.error('process is not a valid child_process');
  process.exit(1);
}

process.once('message', async (data: { scriptPath: string; args: unknown[]; }) => {
  const { scriptPath, args } = data;
  // todo(#136): wrap dynamic import in function
  // eslint-disable-next-line max-len
  // eslint-disable-next-line global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires
  const script = require(scriptPath);
  const mainExists = (typeof script.scriptMain === 'function');

  if (args.length > 0 && !mainExists) {
    if (process.send) {
      process.send({
        type: 'reject',
        error: serializeError(new Error('arguments passed but no scriptMain defined')),
      });
    }
    return;
  }

  if (!mainExists) {
    if (process.send) {
      process.send({
        type: 'resolve',
      });
    }
    return;
  }

  const result = await ConvertReturn(async () => script.scriptMain(...args));
  if (process.send) {
    if (result instanceof SubProcessError) {
      process.send({
        type: 'reject',
        error: result.serialize(),
      });
    } else {
      process.send({
        type: 'resolve',
      });
    }
  }
});
