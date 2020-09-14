import { ConfigValidateObject, validate } from '../../config/index';

export const SASS_VALIDATE: ConfigValidateObject = {
  options: {
    sourceMap: validate.optionally(validate.isOfType('boolean')),
    outputStyle: validate.optionally(validate.isAnyOf('expanded', 'compressed')),
    subFolder: validate.optionally(validate.isOfType('string')), // todo: check for valid path
    singleFolder: validate.optionally(validate.isOfType('boolean')),
    maxDepth: validate.optionally(validate.isNumberInRange({ min: 0, max: undefined })),
  },
  input: validate.isArrayOf(validate.isOfType('string')), // todo: check for valid paths
  output: validate.isOfType('string'), // todo: check for valid paths
};
