import * as _ from 'lodash';

export class ErrorCollection extends Error {
    static ERROR_NAME = 'CollectionError';

    static ALL_ERROR_NAMES = new Set([ErrorCollection.ERROR_NAME])

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

      this.name = ErrorCollection.ERROR_NAME;
    }

    push(error: Error): void {
      if (typeof this.latest !== 'undefined') {
        this.errors.push(this.latest);
      }
      this.latest = error;
      this.message = error.message;
    }

    append(errors: Error[]): void{
      if (errors.length === 0) {
        return;
      }
      if (typeof this.latest !== 'undefined') {
        this.errors.push(this.latest);
      }
      this.latest = _.last(errors);
      this.errors = errors.slice(0, -1);
    }

    concat(other: ErrorCollection): ErrorCollection {
      const thisErrors = (typeof this.latest === 'undefined')
        ? []
        : [...this.errors, this.latest];

      const otherErrors = (typeof other.latest === 'undefined')
        ? []
        : [...other.errors, other.latest];

      return new ErrorCollection([...thisErrors, ...otherErrors]);
    }

    filterByName(name: string): ErrorCollection {
      const thisErrors = typeof this.latest === 'undefined'
        ? []
        : [...this.errors, this.latest];

      const filteredErrors = thisErrors.filter((error) => {
        const errorPrototype = Object.getPrototypeOf(error);
        return ('ALL_ERROR_NAMES' in errorPrototype)
          ? (<Set<string>>errorPrototype.ALL_ERROR_NAMES)
            .has(name)
          : error.name === name;
      });

      return new ErrorCollection(filteredErrors);
    }
}
