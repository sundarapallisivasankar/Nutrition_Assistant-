import assert from 'assert';

// ----------------------------------------------------
// Calculations to test (duplicated for isolation)
// ----------------------------------------------------
const calculateBmi = (weight, height) => {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
};

const calculateBmr = (age, gender, height, weight) => {
  if (gender === 'male') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
};

const calculateTdee = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
};

// ----------------------------------------------------
// Unit Tests definition
// ----------------------------------------------------
const runTests = () => {
  console.log('--- STARTING CALCULATIONS UNIT TESTS ---');

  try {
    // 1. BMI Calculation
    console.log('Testing BMI Calculations...');
    const bmiNormal = calculateBmi(70, 170); // 70 / (1.7^2) = 24.22
    assert.strictEqual(bmiNormal, 24.2, 'BMI should be 24.2 for 70kg, 170cm');
    
    const bmiObese = calculateBmi(100, 170); // 100 / (1.7^2) = 34.6
    assert.strictEqual(bmiObese, 34.6, 'BMI should be 34.6 for 100kg, 170cm');
    console.log('✓ BMI tests passed.');

    // 2. BMR Calculations
    console.log('Testing BMR Calculations...');
    const bmrMale = calculateBmr(25, 'male', 170, 70); // 88.362 + (13.397 * 70) + (4.799 * 170) - (5.677 * 25) = ~1700
    assert.ok(bmrMale > 1600 && bmrMale < 1800, 'Male BMR should be in range ~1700');

    const bmrFemale = calculateBmr(25, 'female', 170, 70); // 447.593 + (9.247 * 70) + (3.098 * 170) - (4.330 * 25) = ~1513
    assert.ok(bmrFemale > 1400 && bmrFemale < 1600, 'Female BMR should be in range ~1513');
    console.log('✓ BMR tests passed.');

    // 3. TDEE Calculations
    console.log('Testing TDEE Calculations...');
    const bmrMock = 1500;
    const tdeeSedentary = calculateTdee(bmrMock, 'sedentary');
    assert.strictEqual(tdeeSedentary, 1800, 'TDEE should be 1800 for 1500 BMR and sedentary');

    const tdeeActive = calculateTdee(bmrMock, 'moderately_active');
    assert.strictEqual(tdeeActive, 2325, 'TDEE should be 2325 for 1500 BMR and active');
    console.log('✓ TDEE tests passed.');

    console.log('--- ALL UNIT TESTS COMPLETED SUCCESSFULLY! ✓ ---');
    process.exit(0);
  } catch (error) {
    console.error('FAIL: Test assertion failed:', error.message);
    process.exit(1);
  }
};

runTests();
