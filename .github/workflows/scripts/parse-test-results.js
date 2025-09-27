#!/usr/bin/env node

const fs = require('fs');
const process = require('process');

// Read the test output file
const testOutputFile = process.argv[2];
if (!testOutputFile) {
  console.error('Usage: node parse-test-results.js <test-output-file>');
  process.exit(1);
}

let testOutput;
try {
  testOutput = fs.readFileSync(testOutputFile, 'utf8');
} catch (error) {
  console.error(`Error reading test output file: ${error.message}`);
  process.exit(1);
}

// Parse the test summary from the output
const summaryRegex = /# tests (\d+)\n# suites (\d+)\n# pass (\d+)\n# fail (\d+)\n# cancelled (\d+)\n# skipped (\d+)\n# todo (\d+)\n# duration_ms ([\d.]+)/;
const match = testOutput.match(summaryRegex);

if (!match) {
  console.error('Could not parse test summary from output');
  console.log('Test output:');
  console.log(testOutput);
  process.exit(1);
}

const [, tests, suites, pass, fail, cancelled, skipped, todo, duration] = match;

// Create summary
const summary = {
  tests: parseInt(tests),
  suites: parseInt(suites),
  pass: parseInt(pass),
  fail: parseInt(fail),
  cancelled: parseInt(cancelled),
  skipped: parseInt(skipped),
  todo: parseInt(todo),
  duration_ms: parseFloat(duration)
};

console.log('## Test Results Summary');
console.log('');
console.log(`- **Tests:** ${summary.tests}`);
console.log(`- **Suites:** ${summary.suites}`);
console.log(`- **Passed:** ${summary.pass} ✅`);
console.log(`- **Failed:** ${summary.fail} ${summary.fail > 0 ? '❌' : '✅'}`);
console.log(`- **Cancelled:** ${summary.cancelled}`);
console.log(`- **Skipped:** ${summary.skipped}`);
console.log(`- **Todo:** ${summary.todo}`);
console.log(`- **Duration:** ${(summary.duration_ms / 1000).toFixed(2)}s`);
console.log('');

// Show detailed output in collapsible section
console.log('<details>');
console.log('<summary>Full Test Output</summary>');
console.log('');
console.log('```');
console.log(testOutput.trim());
console.log('```');
console.log('');
console.log('</details>');

// Exit with failure code if any tests failed
if (summary.fail > 0) {
  console.error(`\nTests failed: ${summary.fail} test(s) failed`);
  process.exit(1);
}

console.log('\n✅ All tests passed!');
process.exit(0);
