import { readFileSync, writeFileSync } from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';

const runPrettier = async (fileName: string): Promise<void> => {
  const type = core.getInput('use-prettier');
  core.debug(type);
  if (!type || type === 'false') {
    return;
  }

  const { issue } = github.context;
  const token = core.getInput('token', { required: true });
  const octokit = github.getOctokit(token);

  const body = readFileSync(fileName, 'utf8');

  if (type === 'lint') {
    try {
      await exec(`yarn prettier --check ${fileName}`);
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
    await exec(`yarn prettier --write ${fileName}`);
  } else {
    throw new Error('unknown prettier type');
  }

  const formatted = readFileSync(fileName, 'utf8');
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

    writeFileSync(fileName, formatted);

    return;
  }

  return;
};

export default runPrettier;
