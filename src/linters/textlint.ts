import * as core from '@actions/core';
import { exec } from '@actions/exec';
import execLogger from '../utils/exec-logger';

const runTextLint = async (fileName: string): Promise<void> => {
  const type = core.getInput('use-textlint');
  core.debug(type);
  if (!type || type === 'false') {
    return;
  }

  await exec(`yarn textlint ${fileName}`);
  await execLogger(
    '[TextLint](https://github.com/textlint/textlint)',
    `yarn textlint ${fileName}`
  );
};

export default runTextLint;
