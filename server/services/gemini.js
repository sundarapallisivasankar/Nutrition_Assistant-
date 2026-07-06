import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Generate AI reply using Gemini API with intelligent mock fallback.
 * @param {string} userMessage - The text message sent by the user
 * @param {Array} history - Previous messages in format [{ role: 'user'|'model', content: '...' }]
 * @returns {Promise<string>} - AI response message
 */
export const getAIChatResponse = async (userMessage, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      // Map history to Gemini's format: user -> user, model -> model. parts: [{ text }]
      const contents = history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Append current user message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const systemInstruction = 
        "You are an expert AI Nutrition Assistant. Answer the user's questions about nutrition, healthy recipes, meal plans, weight loss/gain advice, wellness guidance, and healthy alternatives in an encouraging, scientific yet simple way. Keep responses concise, helpful, and formatted using clean markdown. Do not include external links.";

      const requestBody = {
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('Gemini API Error Response:', JSON.stringify(data));
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API, falling back to mock responses:', error);
    }
  }

  // Smart Mock Fallback Responses if API key is not present or calls fail
  return generateMockAIResponse(userMessage);
};

const generateMockAIResponse = (message) => {
  const msg = message.toLowerCase();

  if (msg.includes('weight loss') || msg.includes('lose weight') || msg.includes('slimming')) {
    return `### Healthy Weight Loss Advice 🥗

To lose weight healthily and sustainably, focus on a **modest calorie deficit** (typically 300-500 kcal below your Maintenance Calories / TDEE) combined with these guidelines:

1. **Prioritize Protein:** Protein increases fullness (satiety) and helps prevent muscle loss while losing fat. Aim for lean sources like chicken breast, fish, tofu, lentils, and eggs.
2. **Increase Dietary Fiber:** Fill half your plate with non-starchy vegetables (spinach, broccoli, cucumbers) and whole grains to feel full longer.
3. **Stay Hydrated:** Drink at least 2.5–3 liters of water daily. Often, thirst is mistaken for hunger.
4. **Resistance Training:** Exercise (like weight lifting or bodyweight exercises) protects muscle tissue and maintains metabolism.

Would you like me to calculate your specific calorie target or suggest a meal plan?`;
  }

  if (msg.includes('weight gain') || msg.includes('gain weight') || msg.includes('bulking') || msg.includes('muscle')) {
    return `### Weight Gain & Muscle Building Guidelines 💪

To gain healthy weight (muscle mass rather than excess body fat), you need a **calorie surplus** and adequate protein intake:

1. **Calorie Surplus:** Aim for 300–500 calories above your daily TDEE (Total Daily Energy Expenditure).
2. **Eat Nutrient-Dense, High-Calorie Foods:** Integrate healthy fats and carbohydrates:
   * Nuts, seeds, almond butter, peanut butter
   * Avocados, whole eggs, olive oil
   * Oats, brown rice, sweet potatoes, quinoa
3. **Protein Intake:** Consume 1.6 to 2.2 grams of protein per kilogram of body weight.
4. **Strength Training:** Lift weights 3-5 times a week, focusing on progressive overload to stimulate muscle protein synthesis.

Let me know your height, weight, and gender if you want me to calculate a detailed bulking macro breakdown!`;
  }

  if (msg.includes('recipe') || msg.includes('cook') || msg.includes('meal suggestion')) {
    return `### Quick High-Protein Breakfast Bowl 🍳

Here is a quick, balanced breakfast recipe that takes less than 10 minutes:

**Ingredients:**
* 1/2 cup Rolled Oats
* 1 cup Unsweetened Almond Milk (or water)
* 1 scoop Whey/Plant Protein Powder (Vanilla or Chocolate)
* 1/2 banana, sliced
* 1 tbsp Chia Seeds or Flax Seeds
* 1 tbsp Peanut Butter

**Instructions:**
1. Cook the oats with almond milk in a saucepan or microwave until soft.
2. Remove from heat, let cool for 1 minute, then stir in the protein powder until smooth.
3. Top with sliced banana, chia seeds, and a drizzle of peanut butter.

**Nutrition:** ~420 kcal | 30g Protein | 45g Carbs | 12g Fat | 8g Fiber.`;
  }

  if (msg.includes('water') || msg.includes('hydration') || msg.includes('drink')) {
    return `### The Importance of Hydration 💧

Water is essential for every physiological function in your body. Here is a summary of the benefits of staying hydrated:

* **Metabolism Boost:** Drinking water can temporarily boost your metabolic rate.
* **Energy Levels & Brain Function:** Even mild dehydration (1-3% of body weight) can impair energy levels, focus, and cause headaches.
* **Digestion & Waste Removal:** Supports regular bowel movements and optimal kidney function.

**How much should you drink?** 
* Men: ~3.0 - 3.7 Liters (100-120 oz) daily
* Women: ~2.2 - 2.7 Liters (75-90 oz) daily
* Adjust upward if you exercise or live in a hot climate. Use our **Water Tracker** dashboard to set custom alerts and check off your progress!`;
  }

  if (msg.includes('diet') || msg.includes('keto') || msg.includes('vegan') || msg.includes('vegetarian')) {
    return `### Choosing the Right Diet Style 🍽️

There is no "single best diet" for everyone. The most effective diet is the one you can stick to long term. Here is an overview of popular setups:

* **Mediterranean Diet:** Rich in olive oil, fish, vegetables, beans, and whole grains. Highly studied for heart health.
* **Keto (Ketogenic):** Very low-carb, high-fat. Shifts your body into *ketosis* (burning fat for fuel). Effective for quick weight loss and blood sugar management, but can be difficult to sustain.
* **Plant-Based (Vegetarian/Vegan):** Focuses on vegetables, grains, seeds, and nuts. Good for cardiovascular markers, though vegans must supplement with Vitamin B12.

Tell me about your health goals so we can choose the ideal diet preference for your profile!`;
  }

  // Default response
  return `### Hello! I am your AI Nutrition Assistant 🍎

I can help you achieve your wellness, dietary, and fitness goals. Ask me questions like:
* "How do I lose weight healthily?"
* "Can you recommend a high-protein recipe?"
* "What is a good alternative to white bread?"
* "How much water should I drink during a workout?"

What are your health and nutrition goals today?`;
};
