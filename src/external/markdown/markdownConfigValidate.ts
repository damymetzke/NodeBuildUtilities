import { ConfigValidateObject, validate } from '../../config/index';

export const MARKDOWN_VALIDATE: ConfigValidateObject = {
  options: {
    xHtml: validate.optionally(validate.isOfType('boolean')),
    styleSheet: validate.optionally(validate.isOfType('string')), // todo: check for valid path
    githubFlavored: validate.optionally(validate.isOfType('boolean')),
    title: validate.optionally(validate.isOfType('string')),

    subFolder: validate.optionally(validate.isOfType('string')), // todo: check for valid path
    singleFolder: validate.optionally(validate.isOfType('boolean')),
    maxDepth: validate.optionally(validate.isNumberInRange({ min: 0, max: undefined })),
    test: validate.optionally(validate.isOfType('string')), // todo: check for valid regex
  },
  input: validate.isArrayOf(validate.isOfType('string')), // todo: check for valid paths
  output: validate.isOfType('string'), // todo: check for valid paths
};
