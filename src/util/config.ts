import { promises as fs } from 'fs';
import { parseYamlOrJson, stringyfyJsonOrYaml } from './index';

const REGEX_JSON_OR_YAML_EXTENSION = /\.(?:json|ya?ml)$/;

export class Config {
    filePath: string;

    readOnly: boolean;

    data: any;

    constructor(filePath: string, readOnly: boolean = false) {
      if (REGEX_JSON_OR_YAML_EXTENSION.test(filePath)) {
        this.filePath = filePath;
        this.readOnly = readOnly;
        return;
      }

      throw new Error(`file '${filePath}' is neither a JSON or YAML file`);
    }

    async load(): Promise<void> {
      this.data = await parseYamlOrJson(this.filePath);

      console.log(this.data);
    }

    async save(): Promise<void> {
      if (this.readOnly) {
        // don't save when set to readonly
        return;
      }
      stringyfyJsonOrYaml(this.filePath, this.data);
    }
}
