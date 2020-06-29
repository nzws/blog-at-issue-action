import { readFileSync, writeFileSync } from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as prettier from 'prettier';

const runPrettier = async (filepath: string): Promise<void> => {
  const type = core.getInput('use-prettier');
  if (!type) {
    return;
  }

  const { issue } = github.context;
  const token = process.env.GITHUB_TOKEN || '';
  const octokit = github.getOctokit(token);

  const body = readFileSync(filepath, 'utf8');
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
