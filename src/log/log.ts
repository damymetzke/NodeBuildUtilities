// todo: move extra classes to different file.
/* eslint-disable max-classes-per-file */

import { LogImplementationConsole } from './logImplementationConsole';

export interface LogImplementation
{
    verbose(values: any[]): void;
    log(values: any[]): void;
    warning(values: any[]): void;
    error(values: any[]): void;
}

export class Logger {
    implementations: LogImplementation[];

    constructor() {
      this.implementations = [
        new LogImplementationConsole(),
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
