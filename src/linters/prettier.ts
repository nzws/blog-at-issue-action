import { readFileSync, writeFileSync } from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as prettier from 'prettier';

const runPrettier = async (filepath: string): Promise<void> => {
  const { issue } = github.context;
  const token = core.getInput('token', { required: true });
  const octokit = github.getOctokit(token);

  const type = core.getInput('use-prettier');
  const body = readFileSync(filepath, 'utf8');
  if (!type) {
    return;
  }

  const options = prettier.resolveConfig.sync(filepath, {
    editorconfig: true
  });

  const formatted = prettier.format(body, options || {});
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
