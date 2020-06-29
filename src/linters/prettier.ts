import { readFileSync, writeFileSync } from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import exec from '../utils/exec';

const runPrettier = async (filepath: string): Promise<void> => {
  const type = core.getInput('use-prettier');
  if (!type) {
    return;
  }

  const { issue } = github.context;
  const token = core.getInput('token', { required: true });
  const octokit = github.getOctokit(token);

  const body = readFileSync(filepath, 'utf8');

  if (type === 'lint') {
    try {
      await exec(`prettier --check ${filepath}`);
    } catch (e) {
      await octokit.issues.createComment({
        owner: issue.owner,
        repo: issue.repo,
        issue_number: issue.number,
        body:
          '*🚧 Alerted by [Prettier](https://prettier.io/)*\n```\n' +
          e.message +
          '\n```'
      });
      throw e;
    }
  } else if (type === 'format') {
    await exec(`prettier --write ${filepath}`);
  } else {
    throw new Error('unknown prettier type');
  }

  const formatted = readFileSync(filepath, 'utf8');
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
      body: '*✨ Formatted by [Prettier](https://prettier.io/)*'
    });

    writeFileSync(filepath, formatted);

    return;
  }

  return;
};

export default runPrettier;
