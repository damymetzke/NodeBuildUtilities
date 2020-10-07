import * as path from 'path';
import { LOGGER, external, runBin } from './lib';

const { renderMarkdownConfig } = external.markdown;

export const buildScripts = {
  buildMarkdown: async () => {
    LOGGER.log("running script: 'buildMarkdown'");
    await renderMarkdownConfig(path.join(__dirname, 'config/markdown.yml'));
  },

  test: async ()=>{
    LOGGER.log("running script: 'test'");
    await runBin('tsc', ['-p', 'test'], {});
    await runBin('jest', [], {});
  }

};
