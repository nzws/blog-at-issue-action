import { readFileSync } from 'fs';
import * as github from '@actions/github';
import * as core from '@actions/core';
import execLogger from '../utils/exec-logger';

const runTextLint = async (fileName: string): Promise<void> => {
  const type = core.getInput('use-textlint');
  core.debug(type);
  if (!type || type === 'false') {
    return;
  }

  const { issue } = github.context;
  const token = core.getInput('token', { required: true });
  const octokit = github.getOctokit(token);
  const textlint = '[TextLint](https://textlint.github.io/)';

  const body = readFileSync(fileName, 'utf8');

  if (type === 'lint') {
    await execLogger(textlint, `yarn textlint ${fileName}`);
  } else if (type === 'format') {
    await execLogger(textlint, `yarn textlint --fix ${fileName}`);
  } else {
    throw new Error('unknown textlint type');
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
      body: `*✨ Formatted by ${textlint}*`
    });
  }
};

export default runTextLint;
