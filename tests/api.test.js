import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

const runApiTests = async () => {
  console.log('--- STARTING BACKEND REST API ENDPOINT TESTS ---');
  console.log(`Connecting to server base at ${BASE_URL}...`);

  try {
    // 1. Test Base Router Connection
    const baseResponse = await fetch(`${BASE_URL}/`);
    const baseData = await baseResponse.json();
    
    assert.strictEqual(baseResponse.status, 200, 'Base API route should return status 200');
    assert.strictEqual(baseData.success, true, 'Base API response should be success: true');
    console.log('✓ Base route check passed.');

    // 2. Test Recipes Endpoint Connection
    const recipeResponse = await fetch(`${BASE_URL}/api/recipes`);
    const recipeData = await recipeResponse.json();

    assert.strictEqual(recipeResponse.status, 200, 'Recipes API route should return status 200');
    assert.strictEqual(recipeData.success, true, 'Recipes response should be success: true');
    assert.ok(Array.isArray(recipeData.data), 'Recipes response payload data should be an array');
    console.log('✓ Recipes endpoint check passed.');

    console.log('--- ALL REST API INTEGRATION TESTS COMPLETED SUCCESSFULLY! ✓ ---');
    process.exit(0);
  } catch (error) {
    console.error('FAIL: API test connection or assertion failed:', error.message);
    console.error('Is the backend server running locally on port 5000? Make sure to launch server before running integration tests.');
    process.exit(1);
  }
};

runApiTests();
