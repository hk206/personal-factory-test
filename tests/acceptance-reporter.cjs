const { appendFileSync } = require('node:fs');

// Only publish identifiers, outcomes and image counts to the PR.
// Test titles, failures and attachments stay in the project's HTML report.
class AcceptanceReporter {
  onEnd(result) {
    if (!process.env.GITHUB_OUTPUT) return;
    const rows = this.suite.allTests().slice(0, 100).map(test => {
      const run = test.results.at(-1);
      const ids = test.title.match(/\bAC[1-9]\d*\b/g) || ['共通'];
      const screenshots = (run?.attachments || []).filter(a => a.contentType === 'image/png');
      return `- ${ids.join(', ')} · ${test.outcome()} · スクリーンショット ${screenshots.length} 枚 · レポート内ID \`${test.id.replace(/[^a-zA-Z0-9_-]/g, '')}\``;
    });
    appendFileSync(process.env.GITHUB_OUTPUT, ['cases<<FACTORY_CASES', ...rows,
      'FACTORY_CASES', ''].join('\n'));
  }

  onBegin(config, suite) {
    this.suite = suite;
  }
}

module.exports = AcceptanceReporter;
