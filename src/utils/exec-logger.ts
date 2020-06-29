import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec, ExecOptions } from '@actions/exec';

const execLogger = async (
  name: string,
  commandLine: string,
  args?: string[],
  options?: ExecOptions
): Promise<void> => {
  const { issue } = github.context;
  const token = core.getInput('token', { required: true });
  const octokit = github.getOctokit(token);
  let output: string = '';

  const updater = (data: Buffer) => (output += data.toString());

  try {
    await exec(commandLine, args, {
      ...options,
      listeners: {
        stdout: updater,
        stderr: updater
      }
    });
  } catch (e) {
    await octokit.issues.createComment({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body: '*🚧 Alerted by ' + name + '*\n```\n' + output + '\n```'
    });
    throw e;
  }
};

export default execLogger;
