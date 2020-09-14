import { ConfigValidateObject, validate } from '../../config/index';

export const SASS_VALIDATE: ConfigValidateObject = {
  config: {
    sourceMap: validate.isOfType('boolean'),
    outputStyle: validate.isAnyOf('expanded', 'compressed'),
    subFolder: validate.isOfType('string'), // todo: check for valid path
    singleFolder: validate.isOfType('boolean'),
    maxDepth: validate.isNumberInRange({ min: 0, max: undefined }),
  },
  input: validate.isArrayOf(validate.isOfType('string')), // todo: check for valid paths
  output: validate.isOfType('string'), // todo: check for valid paths
};
