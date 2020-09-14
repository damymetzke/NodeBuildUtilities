import { LogImplementation } from './log';

export class LogImplementationConsole implements LogImplementation {
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
