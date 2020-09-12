import { ConfigValidateFunction } from './configValidate';

const REGEX_ALPHA = /^[a-zA-Z]*$/;
const REGEX_NUMERIC = /^[0-9]*$/;
const REGEX_ALPHA_NUMERIC = /^[a-zA-Z0-9]*$/;

const REGEX_BINARY = /^(?:0b)[01]*$/;
const REGEX_OCTAL = /^(?:0o)[0-7]*$/;
const REGEX_HEXADECIMAL = /^(?:0x)[0-9abcdefABCCEF]*$/;

function createRegexValidator(
  test: RegExp,
  successText: string,
  failText: string,
): ConfigValidateFunction {
  return (value: any) => {
    if (typeof value !== 'string') {
      return {
        success: false,
        reason: 'value is not a string',
      };
    }
    return test.test(value)
      ? {
        success: true,
        reason: successText,
      }
      : {
        success: false,
        reason: failText,
      };
  };
}

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

export function isAlphaString(): ConfigValidateFunction {
  return createRegexValidator(
    REGEX_ALPHA,
    'value is an alpha string',
    'value is not an alpha string',
  );
}

export function isNumericString(): ConfigValidateFunction {
  return createRegexValidator(
    REGEX_NUMERIC,
    'value is a numeric string',
    'value is not a numeric string',
  );
}

export function isAlphaNumericString(): ConfigValidateFunction {
  return createRegexValidator(
    REGEX_ALPHA_NUMERIC,
    'value is an alpha-numeric string',
    'value is not an alpha-numeric string',
  );
}

export function isBinaryString(): ConfigValidateFunction {
  return createRegexValidator(
    REGEX_BINARY,
    'value is a binary string',
    'value is not a binary string',
  );
}
export function isOctalString(): ConfigValidateFunction {
  return createRegexValidator(
    REGEX_OCTAL,
    'value is an octal string',
    'value is not an octal string',
  );
}
export function isHexadecimalString(): ConfigValidateFunction {
  return createRegexValidator(
    REGEX_HEXADECIMAL,
    'value is a hexadecimal string',
    'value is not a hexadecimal string',
  );
}
