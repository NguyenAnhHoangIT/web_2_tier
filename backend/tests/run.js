import { runHandsTests } from "./hands.test.js";
import { runScoringTests } from "./scoring.test.js";

// Custom lightweight assertion library
const assert = {
  equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Fail: Expected ${expected}, but got ${actual}`);
    }
  },
  deepEqual(actual, expected, message) {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr !== expStr) {
      throw new Error(message || `Fail: Expected ${expStr}, but got ${actStr}`);
    }
  }
};

let passed = 0;
let failed = 0;

function runTestSuite(name, testFn) {
  console.log(`\nRunning Test Suite: ${name}`);
  try {
    testFn(assert);
    console.log(`✅ Passed: ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ Failed: ${name}`);
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    failed++;
  }
}

console.log("=========================================");
console.log("   Running Balatro-Lite Backend Tests    ");
console.log("=========================================");

runTestSuite("Poker Hand Evaluator Tests", runHandsTests);
runTestSuite("Scoring Engine & Joker Tests", runScoringTests);

console.log("\n=========================================");
console.log(`Test Execution Finished.`);
console.log(`Passed: ${passed} suites`);
console.log(`Failed: ${failed} suites`);
console.log("=========================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("All backend tests completed successfully!");
  process.exit(0);
}
