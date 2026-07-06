import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Scale, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../layouts/AppLayout';

const BmiCalculator = () => {
  const { user } = useAuth();
  const [unitSystem, setUnitSystem] = useState('metric'); // metric | imperial

  // Metric fields
  const [weight, setWeight] = useState(user?.weight || 70);
  const [height, setHeight] = useState(user?.height || 170);

  // Imperial fields
  const [weightLbs, setWeightLbs] = useState(Math.round((user?.weight || 70) * 2.20462));
  const [heightFeet, setHeightFeet] = useState(Math.floor((user?.height || 170) / 30.48));
  const [heightInches, setHeightInches] = useState(Math.round(((user?.height || 170) / 2.54) % 12));

  const [bmi, setBmi] = useState(0);
  const [category, setCategory] = useState('');
  const [tips, setTips] = useState([]);

  // Calculate BMI whenever fields change
  useEffect(() => {
    let calculatedBmi = 0;

    if (unitSystem === 'metric') {
      if (weight > 0 && height > 0) {
        const heightM = height / 100;
        calculatedBmi = weight / (heightM * heightM);
      }
    } else {
      const totalInches = heightFeet * 12 + parseInt(heightInches || 0);
      if (weightLbs > 0 && totalInches > 0) {
        calculatedBmi = (weightLbs / (totalInches * totalInches)) * 703;
      }
    }

    const roundedBmi = Math.round(calculatedBmi * 10) / 10;
    setBmi(roundedBmi);

    // Determine category & guidelines
    if (roundedBmi === 0) {
      setCategory('');
      setTips([]);
    } else if (roundedBmi < 18.5) {
      setCategory('Underweight');
      setTips([
        'Focus on nutrient-dense calorie snacks (avocados, seeds, almond butter).',
        'Add progressive resistance training 3 days a week to support muscular mass.',
        'Drink calories through healthy homemade smoothies (oats + yogurt + protein).'
      ]);
    } else if (roundedBmi < 25) {
      setCategory('Normal');
      setTips([
        'Maintain a balanced dietary profile: roughly 45% carbs, 30% fat, 25% protein.',
        'Ensure you stay hydrated by drinking 2.5–3 liters of water daily.',
        'Incorporate regular cardiovascular and weight-bearing training routines.'
      ]);
    } else if (roundedBmi < 30) {
      setCategory('Overweight');
      setTips([
        'Create a modest daily calorie deficit of 300–500 kcal below maintenance levels.',
        'Boost vegetable intake; fill half your lunch/dinner plate with non-starchy greens.',
        'Limit refined sugars and processed flours, substituting with fiber-rich whole grains.'
      ]);
    } else {
      setCategory('Obese');
      setTips([
        'Consult with a certified dietitian or physician for a customized meal plan.',
        'Prioritize low-impact aerobic routines (brisk walking, swimming) to protect joint health.',
        'Track daily food intake diligently to build awareness around snacking cues.'
      ]);
    }
  }, [weight, height, weightLbs, heightFeet, heightInches, unitSystem]);

  const loadFromProfile = () => {
    if (user) {
      setWeight(user.weight || 70);
      setHeight(user.height || 170);
      setWeightLbs(Math.round((user.weight || 70) * 2.20462));
      setHeightFeet(Math.floor((user.height || 170) / 30.48));
      setHeightInches(Math.round(((user.height || 170) / 2.54) % 12));
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">BMI Calculator</h1>
          <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">
            Determine your Body Mass Index score and read customized physical guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <div className="glass-panel p-8 rounded-3xl bg-white/50 dark:bg-slate-900/40 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200/40 pb-4">
              <span className="font-bold text-slate-850 dark:text-slate-205">Calculation Units</span>
              
              {/* Unit Toggle Button */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1">
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    unitSystem === 'metric' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-450 hover:text-slate-600'
                  }`}
                >
                  Metric
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem('imperial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    unitSystem === 'imperial' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-450 hover:text-slate-600'
                  }`}
                >
                  Imperial
                </button>
              </div>
            </div>

            {/* Fields rendering */}
            {unitSystem === 'metric' ? (
              <div className="space-y-4">
                {/* Metric Height */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Height</span>
                    <span>{height} cm</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:bg-slate-800"
                  />
                </div>

                {/* Metric Weight */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Weight</span>
                    <span>{weight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:bg-slate-800"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Imperial Height */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Height</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Feet"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(parseInt(e.target.value) || 0)}
                        className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                      />
                      <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-bold">FT</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Inches"
                        value={heightInches}
                        onChange={(e) => setHeightInches(parseInt(e.target.value) || 0)}
                        className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                      />
                      <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-bold">IN</span>
                    </div>
                  </div>
                </div>

                {/* Imperial Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Weight</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Pounds"
                      value={weightLbs}
                      onChange={(e) => setWeightLbs(parseInt(e.target.value) || 0)}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-bold">LBS</span>
                  </div>
                </div>
              </div>
            )}

            {user && (
              <button
                type="button"
                onClick={loadFromProfile}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 font-semibold text-sm transition-colors text-slate-700 dark:text-slate-350 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Load Stats from Profile
              </button>
            )}
          </div>

          {/* Results Summary Section */}
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-3xl bg-white/50 dark:bg-slate-900/40 flex flex-col justify-between h-fit">
              <div className="text-center space-y-4">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">BMI Rating</span>
                <p className="text-6xl font-extrabold text-slate-800 dark:text-white select-none">{bmi || '0.0'}</p>
                
                {category && (
                  <div
                    style={{
                      color:
                        category === 'Normal' ? '#10b981' :
                        category === 'Underweight' ? '#3b82f6' :
                        category === 'Overweight' ? '#f59e0b' : '#ef4444'
                    }}
                    className="text-xl font-bold uppercase tracking-wide"
                  >
                    {category}
                  </div>
                )}
              </div>

              {/* Dynamic Color indicator Bar */}
              <div className="relative mt-8 h-2.5 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: '18.5%' }} />
                <div className="h-full bg-emerald-500" style={{ width: '25%' }} />
                <div className="h-full bg-amber-500" style={{ width: '20%' }} />
                <div className="h-full bg-red-500" style={{ width: '36.5%' }} />
                
                {/* Pointer indicator */}
                {bmi > 0 && (
                  <div
                    style={{ left: `${Math.min(Math.max((bmi / 40) * 100, 3), 97)}%` }}
                    className="absolute -top-0.5 w-3.5 h-3.5 rounded-full bg-slate-800 dark:bg-white border-2 border-slate-50 shadow-md transform -translate-x-1/2 transition-all duration-300"
                  />
                )}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2">
                <span>&lt;18.5 Under</span>
                <span>18.5-24.9 Normal</span>
                <span>25-29.9 Over</span>
                <span>30+ Obese</span>
              </div>
            </div>

            {/* Suggestions list */}
            <AnimatePresence mode="wait">
              {category && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.3 }}
                  className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20"
                >
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    {category === 'Normal' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    Guidelines for {category} Category
                  </h3>
                  
                  <ul className="space-y-3">
                    {tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-650 dark:text-slate-400 leading-normal">
                        <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BmiCalculator;
