// todo: move extra classes to different file.
/* eslint-disable max-classes-per-file */

export interface LogImplementation
{
    verbose(values: any[]): void;
    log(values: any[]): void;
    warning(values: any[]): void;
    error(values: any[]): void;
}

export class LogImplementation_Console implements LogImplementation {
  // eslint-disable-next-line class-methods-use-this
  verbose(values: any[]): void {
    console.log('[VERBOSE]', ...values);
  }

  // eslint-disable-next-line class-methods-use-this
  log(values: any[]): void {
    console.log('[LOG]', ...values);
  }

  // eslint-disable-next-line class-methods-use-this
  warning(values: any[]): void {
    console.log('[WARNING]', ...values);
  }

  // eslint-disable-next-line class-methods-use-this
  error(values: any[]): void {
    console.log('[ERROR]', ...values);
  }
}

export class Logger {
    implementations: LogImplementation[];

    constructor() {
      this.implementations = [
        new LogImplementation_Console(),
      ];
    }

    verbose(...values: any[]) {
      this.implementations.forEach((implementation) => {
        implementation.verbose(values);
      });
    }

    log(...values: any[]) {
      this.implementations.forEach((implementation) => {
        implementation.log(values);
      });
    }

    warning(...values: any[]) {
      this.implementations.forEach((implementation) => {
        implementation.warning(values);
      });
    }

    error(...values: any[]) {
      this.implementations.forEach((implementation) => {
        implementation.error(values);
      });
    }
}

export const LOGGER = new Logger();
