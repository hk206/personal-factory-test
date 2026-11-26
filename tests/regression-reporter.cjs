// Record only assertions inside the explicitly named regression checkpoint.
const fs = require('node:fs');

class RegressionReporter {
  constructor() { this.tests = {}; this.errors = 0; }
  onError() { this.errors++; }
  onTestEnd(test, result) {
    const assertions = [];
    function walk(steps, marked) {
      for (const step of steps) {
        if (marked && step.category === 'expect') {
          assertions.push({title: step.title, failed: Boolean(step.error)});
        }
        walk(step.steps, marked || (step.category === 'test.step' && step.title === '回帰判定'));
      }
    }
    walk(result.steps, false);
    const key = JSON.stringify([test.parent.project()?.name, ...test.titlePath()]);
    this.tests[key] = {status: result.status, expected: test.expectedStatus, assertions};
  }
  onEnd(result) {
    fs.writeFileSync(process.env.REGRESSION_REPORT, JSON.stringify({
      status: result.status, errors: this.errors, tests: this.tests,
    }));
  }
}
module.exports = RegressionReporter;
