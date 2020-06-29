import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';

const runTextLint = async (fileName: string): Promise<void> => {
  const type = core.getInput('use-textlint');
  core.debug(type);
  if (!type || type === 'false') {
    return;
  }

  const { issue } = github.context;
  const token = core.getInput('token', { required: true });
  const octokit = github.getOctokit(token);

  try {
    await exec(`textlint ${fileName}`);
  } catch (e) {
    await octokit.issues.createComment({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body:
        '*🚧 Alerted by [TextLint](https://github.com/textlint/textlint)*\n```\n' +
        e.message +
        '\n```'
    });
    throw e;
  }

  return;
};

export default runTextLint;
