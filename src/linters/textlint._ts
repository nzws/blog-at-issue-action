import { readFileSync } from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { TextLintEngine } from 'textlint';

const runTextLint = async (filepath: string): Promise<void> => {
  const type = core.getInput('use-textlint');
  if (!type) {
    return;
  }

  const { issue } = github.context;
  const token = core.getInput('token', { required: true });
  const octokit = github.getOctokit(token);

  const body = readFileSync(filepath, 'utf8');
  const engine = new TextLintEngine({
    rulePaths: [
      filepath
        .split('/')
        .filter((_, i, arr) => i !== arr.length - 1)
        .join('/')
    ]
  });

  const result = await engine.executeOnText(body);
  if (engine.isErrorResults(result)) {
    const output = engine.formatResults(result);
    await octokit.issues.createComment({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body:
        '*🚧 Alerted by [TextLint](https://github.com/textlint/textlint)*\n```\n' +
        output +
        '\n```'
    });

    throw new Error(output);
  }

  return;
};

export default runTextLint;
