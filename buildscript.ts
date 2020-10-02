import * as path from 'path';
import { LOGGER, external } from './lib';

const { renderMarkdownConfig } = external.markdown;

export const buildScripts = {
  buildMarkdown: async () => {
    LOGGER.log("running script: 'buildMarkdown'");
    await renderMarkdownConfig(path.join(__dirname, 'config/markdown.yml'));
  },

};
