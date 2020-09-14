import { FileHandle } from 'fs/promises';
import { promises as fs } from 'fs';
import { LogImplementation } from './log';

export class LogImplementationFile implements LogImplementation {
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
