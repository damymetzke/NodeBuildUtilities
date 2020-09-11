import { promises as fs } from 'fs';
import { parseYamlOrJson } from './index';

const REGEX_JSON_OR_YAML_EXTENSION = /\.(?:json|ya?ml)$/;

export class Config {
    filePath: string;

    data: any;

    constructor(filePath: string) {
      if (REGEX_JSON_OR_YAML_EXTENSION.test(filePath)) {
        this.filePath = filePath;
        return;
      }

      throw new Error(`file '${filePath}' is neither a JSON or YAML file`);
    }

    async load(): Promise<void> {
      this.data = await parseYamlOrJson(this.filePath);

      console.log(this.data);
    }
}
