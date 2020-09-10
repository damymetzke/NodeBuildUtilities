// todo: move extra classes to different file.
/* eslint-disable max-classes-per-file */
import { promises as fs } from 'fs';
import { FileHandle } from 'fs/promises';

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

export class LogImplementation_File implements LogImplementation {
    file?: FileHandle;

    isWriting: boolean = false;

    buffer: string = '';

    constructor(filePath: string) {
      (async () => {
        this.file = await fs.open(filePath, 'w');
      })();
    }

    async writeFileImplementation(toPrint: string) {
      if (this.file === undefined) {
        setTimeout(() => this.writeFileImplementation(toPrint), 1000);
      }

      await this.file?.write(toPrint);

      if (this.buffer) {
        this.writeFileImplementation(this.buffer);
        this.buffer = '';
      } else {
        this.isWriting = false;
      }
    }

    writeToFile(channel: string, values: any[]) {
      const toPrint = values.map((value) => String(value))
        .reduce((total, current) => `${total}${current} `, '')
        .slice(0, -1);

      if (this.isWriting) {
        this.buffer += `[${channel.toUpperCase()}] ${toPrint}\n`;
        return;
      }

      this.isWriting = true;
      this.writeFileImplementation(`[${channel.toUpperCase()}], ${toPrint}\n`);
    }

    verbose(values: any[]): void {
      this.writeToFile('verbose', values);
    }

    log(values: any[]): void {
      this.writeToFile('log', values);
    }

    warning(values: any[]): void {
      this.writeToFile('warning', values);
    }

    error(values: any[]): void {
      this.writeToFile('error', values);
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
