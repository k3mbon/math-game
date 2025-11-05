// ESM test runner to execute movement and game system tests
// Usage: node scripts/run-tests.js

(async () => {
  const tests = await import('../src/tests/index.js');

  console.log('\n🧪 Running Movement Tests...');
  try {
    await tests.runMovementTests?.();
  } catch (err) {
    console.error('❌ Movement tests failed:', err?.message || err);
  }

  console.log('\n🧪 Running Comprehensive Test Runner...');
  try {
    const runner = new tests.TestRunner();
    const results = await runner.runAllTests();
    const passed = results.reduce((acc, r) => acc + (r.passed || 0), 0);
    const total = results.reduce((acc, r) => acc + (r.total || 0), 0);
    console.log(`\n📊 Overall: ${passed}/${total} tests passed`);
  } catch (err) {
    console.error('❌ Comprehensive tests failed:', err?.message || err);
  }

  console.log('\n✅ Test execution complete.');
})().catch(err => {
  console.error('❌ Test runner crashed:', err?.message || err);
  process.exit(1);
});