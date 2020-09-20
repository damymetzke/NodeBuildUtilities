import * as _ from 'lodash';

export class ErrorCollection extends Error {
    latest?: Error;

    errors: Error[];

    constructor(errors: Error[]) {
      if (errors.length === 0) {
        super('');
        this.errors = [];
      }

      super(errors[errors.length - 1].message);
      this.latest = _.last(errors);
      this.errors = errors.slice(0, -1);

      this.name = 'CollectionError';
    }

    push(error: Error): void {
      if (typeof this.latest !== 'undefined') {
        this.errors.push(this.latest);
      }
      this.latest = error;
      this.message = error.message;
    }

    concat(errors: Error[]): void{
      if (errors.length === 0) {
        return;
      }
      if (typeof this.latest !== 'undefined') {
        this.errors.push(this.latest);
      }
      this.latest = _.last(errors);
      this.errors = errors.slice(0, -1);
    }
}
