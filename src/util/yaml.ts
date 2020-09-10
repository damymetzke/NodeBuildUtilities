import * as yaml from 'yaml';

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
