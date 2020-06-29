import { readFileSync } from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import execLogger from '../utils/exec-logger';

const runPrettier = async (fileName: string): Promise<void> => {
  const type = core.getInput('use-prettier');
  core.debug(type);
  if (!type || type === 'false') {
    return;
  }

  const { issue } = github.context;
  const token = core.getInput('token', { required: true });
  const octokit = github.getOctokit(token);
  const prettier = '[Prettier](https://prettier.io/)';

  const body = readFileSync(fileName, 'utf8');

  if (type === 'lint') {
    await execLogger(prettier, `yarn prettier --check ${fileName}`);
  } else if (type === 'format') {
    await execLogger(prettier, `yarn prettier --write ${fileName}`);
  } else {
    throw new Error('unknown prettier type');
  }

  const formatted = readFileSync(fileName, 'utf8');
  core.debug(body);
  core.debug(formatted);
  core.debug(body !== formatted ? 'format: true' : 'format: false');
  if (body !== formatted) {
    await octokit.issues.update({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body: formatted
    });
    await octokit.issues.createComment({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body: `*✨ Formatted by ${prettier}*`
    });
  }
};

export default runPrettier;
