import { check as cckCkeck } from 'cck';
import { ConfigValidateFunction } from './configValidation';

const REGEX_ALPHA = /^[a-zA-Z]*$/;
const REGEX_NUMERIC = /^[0-9]*$/;
const REGEX_ALPHA_NUMERIC = /^[a-zA-Z0-9]*$/;

const REGEX_BINARY = /^(?:0b)[01]*$/;
const REGEX_OCTAL = /^(?:0o)[0-7]*$/;
const REGEX_HEXADECIMAL = /^(?:0x)[0-9abcdefABCCEF]*$/;

const REGEX_UUID = /^(?:{[0-9abcdefABCDEF]{8}-[0-9abcdefABCDEF]{4}-[0-9abcdefABCDEF]{4}-[0-9abcdefABCDEF]{4}-[0-9abcdefABCDEF]{12}}|[0-9abcdefABCDEF]{8}-[0-9abcdefABCDEF]{4}-[0-9abcdefABCDEF]{4}-[0-9abcdefABCDEF]{4}-[0-9abcdefABCDEF]{12})$/;

function createRegexValidator(
  test: RegExp,
  successText: string,
  failText: string,
): ConfigValidateFunction {
  return (value: unknown) => {
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

export function optionally(func: ConfigValidateFunction): ConfigValidateFunction {
  return (value: unknown) => {
    if (typeof value === undefined) {
      return {
        success: true,
        reason: 'optional value was not defined',
      };
    }

    return func(value);
  };
}

export function isArrayOf(func: ConfigValidateFunction): ConfigValidateFunction {
  return (value: unknown) => {
    if (!Array.isArray(value)) {
      return {
        success: false,
        reason: 'value is not an array',
      };
    }
    const failures = value.filter((subValue) => {
      const subResult = func(subValue);
      if (typeof subResult === 'boolean') {
        return !subResult;
      }
      return !subResult.success;
    });

    if (failures.length === 0) {
      return {
        success: true,
        reason: 'all values in the array are valid',
      };
    }

    return {
      success: false,
      reason: `one or more values in array are invalid\n${
        typeof failures[0]}` === 'boolean'
        ? ''
        : `first failure:\n${failures[0].reason}`,
    };
  };
}

export function exists(): ConfigValidateFunction {
  return (value: unknown) => (value === undefined
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
  return (value: unknown) => ((typeof value !== expectedType)
    ? {
      success: false,
      reason: `value is not of type ${expectedType}`,
    }
    : {
      success: true,
      reason: `value is of type ${expectedType}`,
    });
}

export function isAnyOf(firstValue: unknown, ...values: unknown[]): ConfigValidateFunction {
  const itemsString = `[${String(firstValue)}${
    values.reduce((total, value) => `${total}, ${value}`, '')
  }]`;
  return (value: unknown) => {
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

export function isNoneOf(firstValue: unknown, ...values: unknown[]): ConfigValidateFunction {
  const itemsString = `[${String(firstValue)}${
    values.reduce((total, value) => `${total}, ${value}`, '')
  }]`;

  return (value: unknown) => {
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

  return (value: unknown) => {
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

export function isUuid(): ConfigValidateFunction {
  return createRegexValidator(
    REGEX_UUID,
    'value is a UUID',
    'value is not a UUID',
  );
}

// todo: write a working email validator, since no package actually validates emails correctly.
export function isEmail(): ConfigValidateFunction {
  return (value: unknown) => {
    if (typeof value !== 'string') {
      return {
        success: false,
        reason: 'value is not a string',
      };
    }

    return cckCkeck(value, 'email')
      ? {
        success: true,
        reason: 'value is a valid email',
      }
      : {
        success: false,
        reason: 'value is not a valid email',
      };
  };
}
