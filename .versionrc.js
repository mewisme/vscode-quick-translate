/** @type {import('standard-version').Options} */
module.exports = {
  types: [
    { type: 'feat', section: 'Added' },
    { type: 'fix', section: 'Fixed' },
    { type: 'perf', section: 'Changed' },
    { type: 'revert', section: 'Removed' },
    { type: 'docs', section: 'Documentation', hidden: true },
    { type: 'style', section: 'Styles', hidden: true },
    { type: 'chore', section: 'Miscellaneous', hidden: true },
    { type: 'refactor', section: 'Changed' },
    { type: 'test', section: 'Tests', hidden: true },
    { type: 'build', section: 'Build System', hidden: true },
    { type: 'ci', section: 'CI/CD', hidden: true },
  ],
  commitUrlFormat: 'https://github.com/mewisme/vscode-quick-translate/commit/{{hash}}',
  compareUrlFormat:
    'https://github.com/mewisme/vscode-quick-translate/compare/{{previousTag}}...{{currentTag}}',
  issueUrlFormat: 'https://github.com/mewisme/vscode-quick-translate/issues/{{id}}',
  releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
  skip: {
    changelog: false,
  },
};
