/** @type {import('standard-version').Options} */
module.exports = {
  types: [
    { type: 'feat', section: 'Added' },
    { type: 'fix', section: 'Fixed' },
    { type: 'perf', section: 'Changed' },
    { type: 'revert', section: 'Removed' },
    { type: 'docs', section: 'Documentation' },
    { type: 'style', section: 'Styles' },
    { type: 'chore', section: 'Miscellaneous' },
    { type: 'refactor', section: 'Changed' },
    { type: 'test', section: 'Tests' },
    { type: 'build', section: 'Build System' },
    { type: 'ci', section: 'CI/CD' },
  ],
  commitUrlFormat: 'https://github.com/mewisme/vscode-quick-translate/commit/{{hash}}',
  compareUrlFormat:
    'https://github.com/mewisme/vscode-quick-translate/compare/{{previousHash}}...{{currentHash}}',
  issueUrlFormat: 'https://github.com/mewisme/vscode-quick-translate/issues/{{id}}',
  releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
  skip: {
    changelog: false,
  },
};
