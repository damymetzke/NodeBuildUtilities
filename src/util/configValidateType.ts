import { ConfigValidateFunction, ConfigValidateResult } from './configValidate';

export function exists(): ConfigValidateFunction {
  return (value: any) => (value === undefined
    ? {
      success: false,
      reason: 'key does not exist',
    }
    : {
      success: true,
      reason: 'key exists',
    });
}

export function isOfType(expectedType: 'number' | 'string' | 'boolean' | 'object' | 'function' | 'symbol' | 'undefined'): ConfigValidateFunction {
  return (value: any) => ((typeof value !== expectedType)
    ? {
      success: false,
      reason: `value is not of type ${expectedType}`,
    }
    : {
      success: true,
      reason: `value is of type ${expectedType}`,
    });
}

export function isAnyOf(firstValue: any, ...values: any[]): ConfigValidateFunction {
  const itemsString = `[${String(firstValue)}${
    values.reduce((total, value) => `${total}, ${value}`, '')
  }]`;
  return (value: any) => {
    if ([firstValue, ...values].some((testValue) => value === testValue)) {
      return {
        success: true,
        reason: `value is part of expected items: ${itemsString}`,
      };
    }
    return {
      success: false,
      reason: `value is not part of expected items: ${itemsString}`,
    };
  };
}

export function isNoneOf(firstValue: any, ...values: any[]): ConfigValidateFunction {
  const itemsString = `[${String(firstValue)}${
    values.reduce((total, value) => `${total}, ${value}`, '')
  }]`;

  return (value: any) => {
    if ([firstValue, ...values].every((testValue) => value === testValue)) {
      return {
        success: true,
        reason: `value is not part of unexpected items: ${itemsString}`,
      };
    }
    return {
      success: false,
      reason: `value is part of unexpected items: ${itemsString}`,
    };
  };
}

export function isNumberInRange({ min, max }:
    {min: number, max: number}
    | {min: number, max: undefined}
    | {min: undefined, max: number}): ConfigValidateFunction {
  const rangeString = `${
    min === undefined
      ? ''
      : `${min} >= `
  }n${
    max === undefined
      ? ''
      : ` < ${max}`
  }`;

  return (value: any) => {
    if (typeof value !== 'number') {
      return {
        success: false,
        reason: 'value is not a number',
      };
    }

    if (
      (min !== undefined && value < min)
        || (max !== undefined && value >= max)
    ) {
      return {
        success: false,
        reason: `value is not within range: ${rangeString}`,
      };
    }

    return {
      success: true,
      reason: `value is within range: ${rangeString}`,
    };
  };
}
