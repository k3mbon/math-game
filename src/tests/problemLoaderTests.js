import { ensureProblemsLoaded, selectRandomProblem } from '../utils/problemLoader.js';

/**
 * Problem Loader Test Suite
 * Validates loading, selection, and normalization across Numeration/Literation banks
 */
class ProblemLoaderTestSuite {
  constructor() {
    this.testResults = [];
  }

  async testLoadBothBanks() {
    console.log('📚 Testing problem bank loading (numeration + literation)...');
    const { numeration, literation, error } = await ensureProblemsLoaded();
    const numOk = Array.isArray(numeration) && numeration.length > 0;
    const litOk = Array.isArray(literation) && literation.length > 0;
    this.testResults.push({
      test: 'problem_loader',
      name: 'Load Numeration bank',
      expected: true,
      actual: numOk,
      passed: numOk,
      count: Array.isArray(numeration) ? numeration.length : 0,
      error: error || null
    });
    this.testResults.push({
      test: 'problem_loader',
      name: 'Load Literation bank',
      expected: true,
      actual: litOk,
      passed: litOk,
      count: Array.isArray(literation) ? literation.length : 0,
      error: error || null
    });
    console.log(`  ${numOk ? '✅' : '❌'} Numeration loaded (${numeration?.length || 0})`);
    console.log(`  ${litOk ? '✅' : '❌'} Literation loaded (${literation?.length || 0})`);
  }

  async testSelectionDistribution() {
    console.log('🎲 Testing equal-source selection distribution...');
    const { numeration, literation } = await ensureProblemsLoaded();
    let numCount = 0, litCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      const q = selectRandomProblem(numeration, literation, 2);
      if (!q) continue;
      if (q.source === 'numeration') numCount++; else if (q.source === 'literation') litCount++;
    }
    const ratio = numCount / Math.max(1, (numCount + litCount));
    const fair = ratio >= 0.4 && ratio <= 0.6; // allow some randomness
    this.testResults.push({
      test: 'problem_selection',
      name: 'Equal-source selection ~50/50',
      expected: '40%-60% numeration share',
      actual: `${(ratio * 100).toFixed(1)}%`,
      passed: fair,
      counts: { numeration: numCount, literation: litCount }
    });
    console.log(`  ${fair ? '✅' : '❌'} Distribution: num=${numCount}, lit=${litCount} (${(ratio * 100).toFixed(1)}%)`);
  }

  async testNormalizationAndFields() {
    console.log('🧹 Testing normalization (statement fallback) and field presence...');
    const { numeration, literation } = await ensureProblemsLoaded();
    const all = [...(numeration || []), ...(literation || [])];
    const allHaveStatement = all.every(p => typeof p.statement === 'string' && p.statement.length > 0);
    const allHaveTitleAnswer = all.every(p => typeof p.title === 'string' && p.answer !== undefined);
    this.testResults.push({
      test: 'problem_normalization',
      name: 'All problems have statement/title/answer',
      expected: true,
      actual: allHaveStatement && allHaveTitleAnswer,
      passed: allHaveStatement && allHaveTitleAnswer,
      count: all.length
    });
    console.log(`  ${(allHaveStatement && allHaveTitleAnswer) ? '✅' : '❌'} Normalization OK on ${all.length} items`);
  }

  async testDepthFiltering() {
    console.log('📏 Testing depth-level filtering in selection...');
    const { numeration, literation } = await ensureProblemsLoaded();
    const q1 = selectRandomProblem(numeration, literation, 1);
    const levelOk = !q1?.level || q1.level <= 1; // problems without level pass by default
    this.testResults.push({
      test: 'problem_selection',
      name: 'Depth filter respects level ≤ 1',
      expected: true,
      actual: !!levelOk,
      passed: !!levelOk,
      picked: q1?.title || 'none'
    });
    console.log(`  ${levelOk ? '✅' : '❌'} Depth filtering OK`);
  }

  async runAllTests() {
    await this.testLoadBothBanks();
    await this.testSelectionDistribution();
    await this.testNormalizationAndFields();
    await this.testDepthFiltering();
    this.generateReport();
    return this.testResults;
  }

  generateReport() {
    console.log('\n🧪 Problem Loader Test Report');
    const passed = this.testResults.filter(r => r.passed).length;
    console.log(`✅ Passed: ${passed}/${this.testResults.length}`);
  }
}

export { ProblemLoaderTestSuite };

if (process.env.NODE_ENV === 'development') {
  window.runProblemLoaderTests = async () => {
    const suite = new ProblemLoaderTestSuite();
    return await suite.runAllTests();
  };
}