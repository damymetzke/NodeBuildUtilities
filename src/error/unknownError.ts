export class UnknownError extends Error {
    static ERROR_NAME = 'unknown-error';

    static ALL_ERROR_NAMES = new Set([
      UnknownError.ERROR_NAME,
    ])

    constructor(val: unknown) {
      if (typeof val === 'string') {
        super(`recieved incorrect error string with value: ${val}`);
      } else {
        super(`recieved incorrect error of type ${typeof val}`);
      }

      this.name = UnknownError.ERROR_NAME;
    }
}
