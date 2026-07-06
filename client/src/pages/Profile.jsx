import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNotification } from '../contexts/NotificationContext';
import { Loader2, Camera, User, HelpCircle, Save, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import AppLayout from '../layouts/AppLayout';

const profileValidation = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  age: z.coerce.number().int().min(1, 'Age must be positive').max(120),
  gender: z.enum(['male', 'female', 'other']),
  height: z.coerce.number().min(30, 'Height must be valid').max(300),
  weight: z.coerce.number().min(10, 'Weight must be valid').max(500),
  goal: z.enum(['lose_weight', 'gain_weight', 'maintain_weight', 'build_muscle']),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
  dietPreference: z.enum(['standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'low_carb']),
  medicalConditions: z.string().optional(), // Entered as comma separated text
  foodAllergies: z.string().optional(),     // Entered as comma separated text
  dailyCalorieGoal: z.coerce.number().min(500).max(10000),
  dailyWaterGoal: z.coerce.number().min(500).max(10000),
});

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showNotification } = useNotification();
  
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Convert arrays to comma separated values for form display
  const defaultMedical = user?.medicalConditions?.join(', ') || '';
  const defaultAllergies = user?.foodAllergies?.join(', ') || '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileValidation),
    defaultValues: {
      name: user?.name || '',
      age: user?.age || 25,
      gender: user?.gender || 'male',
      height: user?.height || 170,
      weight: user?.weight || 70,
      goal: user?.goal || 'maintain_weight',
      activityLevel: user?.activityLevel || 'sedentary',
      dietPreference: user?.dietPreference || 'standard',
      medicalConditions: defaultMedical,
      foodAllergies: defaultAllergies,
      dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
      dailyWaterGoal: user?.dailyWaterGoal || 2500,
    },
  });

  // Watch stats for live BMR/TDEE calculation display
  const wAge = watch('age');
  const wGender = watch('gender');
  const wHeight = watch('height');
  const wWeight = watch('weight');
  const wActivity = watch('activityLevel');
  const wGoal = watch('goal');

  // Calculate live calculations
  let liveBMR = 0;
  if (wWeight && wHeight && wAge) {
    if (wGender === 'male') {
      liveBMR = Math.round(88.362 + 13.397 * wWeight + 4.799 * wHeight - 5.677 * wAge);
    } else {
      liveBMR = Math.round(447.593 + 9.247 * wWeight + 3.098 * wHeight - 4.330 * wAge);
    }
  }

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const liveTDEE = Math.round(liveBMR * (activityMultipliers[wActivity] || 1.2));
  
  let recommendedCalories = liveTDEE;
  if (wGoal === 'lose_weight') recommendedCalories = liveTDEE - 450;
  else if (wGoal === 'gain_weight') recommendedCalories = liveTDEE + 400;
  else if (wGoal === 'build_muscle') recommendedCalories = liveTDEE + 200;

  const recommendedWater = Math.round(wWeight * 35); // 35ml per kg

  const applyCalculations = () => {
    if (recommendedCalories > 500) {
      setValue('dailyCalorieGoal', recommendedCalories);
    }
    if (recommendedWater > 500) {
      setValue('dailyWaterGoal', recommendedWater);
    }
    showNotification('Applied live suggestions to target fields!', 'info');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePhoto', file);

    setUploadingPhoto(true);
    const result = await updateProfile(formData);
    setUploadingPhoto(false);

    if (result.success) {
      showNotification('Profile photo uploaded!', 'success');
    } else {
      showNotification(result.message || 'Failed to upload photo.', 'error');
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);

    // Format fields back to string arrays
    const formattedData = {
      ...data,
      medicalConditions: data.medicalConditions
        ? data.medicalConditions.split(',').map((val) => val.trim()).filter(Boolean)
        : [],
      foodAllergies: data.foodAllergies
        ? data.foodAllergies.split(',').map((val) => val.trim()).filter(Boolean)
        : [],
    };

    const result = await updateProfile(formattedData);
    setSubmitting(false);

    if (result.success) {
      showNotification('Profile updated successfully!', 'success');
    } else {
      showNotification(result.message || 'Update failed.', 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">My Profile</h1>
          <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">
            Manage your physical stats, medical exclusions, allergy checks, and daily metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Profile Picture & Live Math */}
          <div className="space-y-6">
            {/* Avatar card */}
            <div className="glass-panel p-6 rounded-3xl text-center bg-white/50 dark:bg-slate-900/40 relative">
              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-100 flex items-center justify-center group mb-4">
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center text-white z-10">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                    {user?.name.charAt(0)}
                  </span>
                )}
                
                {/* Photo hover overlay */}
                <label className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white cursor-pointer transition-all">
                  <Camera className="w-6 h-6" />
                  <input type="file" onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                </label>
              </div>

              <h2 className="font-extrabold text-lg text-slate-850 dark:text-slate-100">{user?.name}</h2>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono block">{user?.email}</span>
              
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 capitalize">
                Goal: {user?.goal.replace('_', ' ')}
              </div>
            </div>

            {/* Calculations suggestion card */}
            <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white/50 to-teal-500/10 dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-teal-950/20 border-emerald-500/20">
              <h3 className="font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-emerald-500" /> Suggestions Tool
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/40">
                  <span className="text-slate-500 dark:text-slate-400">Calculated BMR</span>
                  <span className="font-bold text-slate-750 dark:text-slate-200">{liveBMR} kcal</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/40">
                  <span className="text-slate-500 dark:text-slate-400">Calculated TDEE</span>
                  <span className="font-bold text-slate-750 dark:text-slate-200">{liveTDEE} kcal</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/40 bg-emerald-500/5 p-1 rounded">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Suggested Calorie Goal</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{recommendedCalories} kcal</span>
                </div>
                <div className="flex justify-between items-center pb-2 bg-emerald-500/5 p-1 rounded">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Suggested Water Goal</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{recommendedWater} ml</span>
                </div>

                <button
                  type="button"
                  onClick={applyCalculations}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Apply suggestions
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Edit form */}
          <div className="lg:col-span-2">
            <div className="glass-panel p-8 rounded-3xl bg-white/50 dark:bg-slate-900/40">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-200/40 pb-2">
                  Physical Statistics & Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                    />
                    {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name.message}</p>}
                  </div>

                  {/* Age field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                      Age
                    </label>
                    <input
                      type="number"
                      {...register('age')}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                    />
                    {errors.age && <p className="text-xs font-semibold text-red-500">{errors.age.message}</p>}
                  </div>

                  {/* Gender field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                      Gender
                    </label>
                    <select
                      {...register('gender')}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white dark:bg-slate-900"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Height field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      {...register('height')}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                    />
                    {errors.height && <p className="text-xs font-semibold text-red-500">{errors.height.message}</p>}
                  </div>

                  {/* Weight field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      {...register('weight')}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                    />
                    {errors.weight && <p className="text-xs font-semibold text-red-500">{errors.weight.message}</p>}
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-200/40 pb-2 pt-2">
                  Lifestyle & Goals
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Goal field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                      Fitness Goal
                    </label>
                    <select
                      {...register('goal')}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white dark:bg-slate-900"
                    >
                      <option value="lose_weight">Lose Weight</option>
                      <option value="gain_weight">Gain Weight</option>
                      <option value="maintain_weight">Maintain Weight</option>
                      <option value="build_muscle">Build Muscle</option>
                    </select>
                  </div>

                  {/* Activity Level field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                      Activity Level
                    </label>
                    <select
                      {...register('activityLevel')}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white dark:bg-slate-900"
                    >
                      <option value="sedentary">Sedentary (desk job)</option>
                      <option value="lightly_active">Lightly Active (1-3 days exercise)</option>
                      <option value="moderately_active">Moderately Active (3-5 days exercise)</option>
                      <option value="very_active">Very Active (6-7 days intense sports)</option>
                      <option value="extra_active">Extra Active (professional training)</option>
                    </select>
                  </div>

                  {/* Diet Preference field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400">
                      Diet Preference
                    </label>
                    <select
                      {...register('dietPreference')}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white dark:bg-slate-900"
                    >
                      <option value="standard">Standard</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="keto">Keto (Ketogenic)</option>
                      <option value="paleo">Paleo</option>
                      <option value="low_carb">Low Carbohydrate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Medical Conditions */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400">
                      Medical Exclusions (comma separated)
                    </label>
                    <input
                      type="text"
                      {...register('medicalConditions')}
                      placeholder="e.g. Hypertension, Diabetes"
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                    />
                  </div>

                  {/* Food Allergies */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400">
                      Food Allergies (comma separated)
                    </label>
                    <input
                      type="text"
                      {...register('foodAllergies')}
                      placeholder="e.g. Peanuts, Gluten"
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                    />
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-200/40 pb-2 pt-2">
                  Target Daily Allowances
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calorie Goal field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400">
                      Daily Calorie Goal (kcal)
                    </label>
                    <input
                      type="number"
                      {...register('dailyCalorieGoal')}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                    />
                    {errors.dailyCalorieGoal && (
                      <p className="text-xs font-semibold text-red-500">{errors.dailyCalorieGoal.message}</p>
                    )}
                  </div>

                  {/* Water Goal field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-400">
                      Daily Water Goal (ml)
                    </label>
                    <input
                      type="number"
                      {...register('dailyWaterGoal')}
                      className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm dark:text-white"
                    />
                    {errors.dailyWaterGoal && (
                      <p className="text-xs font-semibold text-red-500">{errors.dailyWaterGoal.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md active:scale-95 transition-all cursor-pointer w-full md:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile Details
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default Profile;
