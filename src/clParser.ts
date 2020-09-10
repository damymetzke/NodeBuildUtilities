export class ClParsed {
    positional: string[];

    options: { [ key: string ]: string[]; } = {};

    flags: { [ key: string ]: boolean; } = {};

    constructor(positional: string[]) {
      this.positional = positional;
    }

    option(name: string, num: number): this {
      let remaining = 0;
      this.positional = this.positional.reduce((total: string[], current: string) => {
        if (remaining > 0) {
          this.options[name].push(current);
          --remaining;
          return total;
        }

        if (current === `--${name}`) {
          if (name in this.options) {
            throw new Error(`option '${name}' set twice`);
          }

          this.options[name] = [];
          remaining = num;
          return total;
        }

        return [...total, current];
      }, []);

      return this;
    }

    flag(name: string): this {
      this.flags[name] = false;

      this.positional = this.positional.reduce((total: string[], current: string) => {
        if (current !== `--${name}`) {
          return [...total, current];
        }
        this.flags[name] = true;
        return total;
      }, []);

      return this;
    }

    hasFlag(name: string): boolean {
      return Boolean(this.flags[name]);
    }

    hasOption(name: string): Boolean {
      return (name in this.options);
    }

    getOption(name: string): string[] {
      if (!this.hasOption(name)) {
        return [];
      }

      return this.options[name];
    }
}

export function parse(args: string[]): ClParsed {
  return new ClParsed(args);
}
