import * as _ from 'lodash';
import { Config } from './index';

export interface ConfigValidateUnused
{
    type: 'unused';
    key: string;
}
export interface ConfigValidateResult
{
    type: 'result';
    key: string;
    success: boolean;
    reason: string;
}

export type ConfigValidateFunction = (object: unknown)=>Omit<ConfigValidateResult, 'key'|'type'>|boolean;

export type ConfigValidateObject = {
    [key: string]: ConfigValidateObject | ConfigValidateFunction
}

function validateConfigImplementation(
  // todo: fix this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any,
  validate: ConfigValidateObject | ConfigValidateFunction,
  key: string,
): (ConfigValidateResult | ConfigValidateUnused)[] {
  if (typeof validate === 'function') {
    const validateResult = validate(config);
    if (typeof validateResult === 'boolean') {
      return [{
        type: 'result',
        key,
        success: validateResult,
        reason: '',
      }];
    }

    return [
      {
        type: 'result',
        key,
        ...validateResult,
      },
    ];
  }
  if (typeof config !== 'object') {
    return [];
  }
  const subObjectResults = Object.entries(validate)
    .map(([subKey, value]) => validateConfigImplementation(
      config[subKey],
      value,
      key
        ? `${key}.${subKey}`
        : subKey,
    ));

  const unusedResult = Object.keys(config)
    .filter((configKey) => Object.keys(validate)
      .every((validateKey) => validateKey !== configKey))
    .map((unusedKey) => <ConfigValidateUnused>{
      type: 'unused',
      key: unusedKey,
    });

  return _.flatten<ConfigValidateResult | ConfigValidateUnused>([
    ...subObjectResults,
    ...unusedResult,
  ]);
}

export function validateConfig(config: Config, validate: ConfigValidateObject):
    {success: true} | {success: false, reasons: [string, string][]} {
  const results = <ConfigValidateResult[]>validateConfigImplementation(config.data, validate, '')
    .filter((result) => result.type === 'result' && result.success === false);
  if (results.length === 0) {
    return { success: true };
  }

  return {
    success: false,
    reasons: results.map((result) => [result.key, result.reason]),
  };
}

export function validateConfigExclusive(config: Config, validate: ConfigValidateObject):
    {success: true} | {success: false, reasons: [string, string][]} {
  const results = validateConfigImplementation(config.data, validate, '')
    .filter((result) => result.type === 'unused' || result.success === false);
  if (results.length === 0) {
    return { success: true };
  }

  return {
    success: false,
    reasons: results.map((result) => (result.type === 'result'
      ? [result.key, result.reason]
      : [result.key, 'unexpected key'])),
  };
}
