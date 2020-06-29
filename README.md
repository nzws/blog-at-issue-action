# 📗 Blog@Issue

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nzws/blog-at-issue-action/Node%20CI?style=for-the-badge)](https://github.com/nzws/blog-at-issue-action/actions)
[![GitHub](https://img.shields.io/github/license/nzws/blog-at-issue-action?style=for-the-badge)](#license)
[![code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge&logo=prettier)](https://prettier.io/)
[![dependabot enabled](https://img.shields.io/badge/dependabot-enabled-0366D6.svg?style=for-the-badge&logo=dependabot)](https://github.com/nzws/blog-at-issue-action/pulls?utf8=%E2%9C%93&q=is%3Apr+label%3Adependencies+)

> Easily post to your md blog (e.g. Hexo) using GitHub Issue.

## Usage

### Install

Create `.github/workflows/blog.yml`.

```yaml
name: Create/Update blog post
on:
  - issues
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: nzws/blog-at-issue-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          filepath: 'blog-post/posts/{title}.md'
          label: 'blog' # Optional
          use-prettier: true # Optional
          use-textlint: true # Optional
```

Inputs:

- `token`: GitHub's token (Use `${{ secrets.GITHUB_TOKEN }}`)
- `filepath`: The path of the markdown to save.
  - `{title}`: Issue's title
- `label`: (Optional, default: `'blog'`) An issue labels to trigger.
- `use-prettier`: (Optional, default: false) Format the markdown. The formatting result is also reflected in Issue. `'lint'` or `'format'` or `false`
  - Using project's prettier config.
- `use-textlint`: (Optional, default: false) Check the grammar of the text. If corrections are needed, send you the comment. `true` or `false`
  - Using project's textlint config.

### Create new post

WIP

### Update the post

WIP

## License

- code: MIT
