import * as yaml from 'yaml';
import { promises as fs } from 'fs';
import * as path from 'path';

const REGEX_JSON_EXTENSION = /\.json$/;
const REGEX_YAML_EXTENSION = /\.ya?ml$/;

export function jsonToYaml(from: string): string {
  const raw = JSON.parse(from);
  return yaml.stringify(
    raw,
    {
      version: '1.2',
    },
  );
}
export function yamlToJson(from: string): string {
  const raw = yaml.parse(
    from,
    {
      version: '1.2',
      merge: true,
    },
  );
  return JSON.stringify(
    raw,
    null,
    2,
  );
}

export async function jsonToYamlFile(source: string, target: string): Promise<void> {
  const jsonData = await fs.readFile(source);
  const yamlData = jsonToYaml(jsonData.toString());
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, yamlData);
}

export async function yamlToJsonFile(source: string, target: string): Promise<void> {
  const yamlData = await fs.readFile(source);
  const jsonData = yamlToJson(yamlData.toString());
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, jsonData);
}

export async function parseYamlOrJson(source: string): Promise<any> {
  const data = await fs.readFile(source);
  if (REGEX_JSON_EXTENSION.test(source)) {
    return JSON.parse(data.toString());
  }
  if (REGEX_YAML_EXTENSION.test(source)) {
    return yaml.parse(
      data.toString(),
      {
        version: '1.2',
        merge: true,
      },
    );
  }

  throw new Error(`file '${source}' is not a json or yaml file`);
}
