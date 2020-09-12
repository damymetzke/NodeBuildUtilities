import * as _ from 'lodash';
import { Console } from 'console';
import { Config } from './index';

export interface ConfigValidateResult
{
    key: string;
    success: boolean;
    reason: string;
}

export type ConfigValidateFunction = (object: any)=>Omit<ConfigValidateResult, 'key'>|boolean;

export type ConfigValidateObject = {
    [key: string]: ConfigValidateObject | ConfigValidateFunction
}

function validateConfigImplementation(
  config: any,
  validate: ConfigValidateObject | ConfigValidateFunction,
  key: string,
): ConfigValidateResult[] {
  if (typeof validate === 'function') {
    const validateResult = validate(config);
    if (typeof validateResult === 'boolean') {
      return [{
        key,
        success: validateResult,
        reason: '',
      }];
    }

    return [
      {
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

  return _.flatten(subObjectResults);
}

export function validateConfig(config: Config, validate: ConfigValidateObject):
    {success: true} | {success: false, reasons: [string, string][]} {
  const results = validateConfigImplementation(config.data, validate, '')
    .filter((result) => result.success === false);
  if (results.length === 0) {
    return { success: true };
  }

  return {
    success: false,
    reasons: results.map((result) => [result.key, result.reason]),
  };
}
