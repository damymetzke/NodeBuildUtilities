import { promises as fs } from 'fs';
import * as _ from 'lodash';
import { parseYamlOrJson, stringyfyJsonOrYaml } from './index';

const REGEX_JSON_OR_YAML_EXTENSION = /\.(?:json|ya?ml)$/;
const REGEX_VALID_KEY = /^[a-zA-Z]+(?:\.[a-zA-Z]+)*$/;

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
    }

    async save(): Promise<void> {
      if (this.readOnly) {
        // don't save when set to readonly
        return;
      }
      stringyfyJsonOrYaml(this.filePath, this.data);
    }

    get<T = any>(key: string): T {
      if (!REGEX_VALID_KEY.test(key)) {
        throw new Error(`invalid key '${key}'`);
      }

      return _.get(this.data, key);
    }

    set<T>(key: string, value: T): void{
      if (!REGEX_VALID_KEY.test(key)) {
        throw new Error(`invalid key '${key}'`);
      }

      _.set(this.data, key, value);
    }
}