import { writeFileSync } from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';
import Git, { SimpleGit } from 'simple-git';

import replaceStr from './utils/replace';
import isExist from './utils/is-exist';
import runPrettier from './linters/prettier';
import runTextLint from './linters/textlint';

(async () => {
  try {
    const { payload, issue } = github.context;
    const token = core.getInput('token', { required: true });
    const octokit = github.getOctokit(token);
    const repo = process.env.GITHUB_REPOSITORY;
    if (
      !payload.issue ||
      payload.issue.locked ||
      !['opened', 'edited', 'reopened', 'labeled'].includes(
        payload.action || ''
      )
    ) {
      core.info('exit: not issue / locked / action');
      return;
    }

    const body = payload.issue.body;
    if (!body) {
      core.info('exit: body is nothing');
      return;
    }
    const label = core.getInput('label') || 'blog';
    if (
      !payload.issue.labels.some(({ name }: { name: string }) => label === name)
    ) {
      core.info('exit: has not label');
      return;
    }

    const fileName = replaceStr(core.getInput('filepath'), {
      title: payload.issue.title
    });
    const branch = `blog-at-issue/${fileName}`;
    // core.setOutput('branch', branch);

    await exec(`git config --global user.email action@github.com`);
    await exec(`git config --global user.name GitHubAction`);

    const search = await octokit.search.issuesAndPullRequests({
      q: `repo:${repo} is:pr author:app/github-actions is:open ${fileName}`
    });
    const isExistPR = !!search.data.items[0]; // 現在進行中のPR

    const git: SimpleGit = Git();

    if (isExistPR) {
      // ブランチの残骸が残ってれば消す
      const branches = await git.branch();
      if (branches.all.includes(branch)) {
        await git.branch(['-D', branch]);
      }
      await octokit.git.deleteRef({
        owner: issue.owner,
        repo: issue.repo,
        ref: `heads/${branch}`
      });
    }

    await git.checkoutLocalBranch(branch);

    await exec(`yarn install --pure-lockfile`);

    const isExistFile = isExist(fileName);
    writeFileSync(fileName, body);

    await runPrettier(fileName).then(() => runTextLint(fileName));
    await git.add(fileName);

    const status = await git.status();
    if (!status.modified[0] && !status.created[0]) {
      core.info('exit: has not any changes');
      return;
    }

    await git.commit(`${isExistFile ? 'Update' : 'Create'} ${fileName}`);
    await exec(
      `git push 'https://${process.env.GITHUB_ACTOR}:${token}@github.com/${repo}.git' HEAD:${branch}`
    );

    if (!isExistPR) {
      const pr = await octokit.pulls.create({
        owner: issue.owner,
        repo: issue.repo,
        title: `${isExistFile ? 'Update' : 'Create'} ${fileName} by Blog@Issue`,
        head: branch,
        base: payload.repository?.default_branch || 'master'
      });

      await octokit.issues.createComment({
        owner: issue.owner,
        repo: issue.repo,
        issue_number: issue.number,
        body: `Congrats!✨ A pull request: #${pr.data.number} has been created!`
      });
    }
  } catch (e) {
    core.setFailed(e.message);
  }
})();
