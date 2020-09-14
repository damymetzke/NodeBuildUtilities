import { LogImplementationConsole } from './logImplementationConsole';

export interface LogImplementation
{
    verbose(values: unknown[]): void;
    log(values: unknown[]): void;
    warning(values: unknown[]): void;
    error(values: unknown[]): void;
}

export class Logger {
    implementations: LogImplementation[];

    constructor() {
      this.implementations = [
        new LogImplementationConsole(),
      ];
    }

    verbose(...values: unknown[]): void {
      this.implementations.forEach((implementation) => {
        implementation.verbose(values);
      });
    }

    log(...values: unknown[]): void {
      this.implementations.forEach((implementation) => {
        implementation.log(values);
      });
    }

    warning(...values: unknown[]): void {
      this.implementations.forEach((implementation) => {
        implementation.warning(values);
      });
    }

    error(...values: unknown[]): void {
      this.implementations.forEach((implementation) => {
        implementation.error(values);
      });
    }
}

export const LOGGER = new Logger();
