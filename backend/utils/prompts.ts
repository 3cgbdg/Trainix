// Prompts ported from the Python service (main.py). Kept close to the originals so
// output shape stays stable; the changes are noted where they were made.

export type LlmUserInfo = {
    height?: number;
    weight?: number;
    targetWeight?: number;
    primaryFitnessGoal?: string;
    fitnessLevel?: string;
    gender?: string;
    waistToHipRatio?: number;
    shoulderToWaistRatio?: number;
    bodyFatPercent?: number;
    muscleMass?: number;
    leanBodyMass?: number;
};

const userBlock = (userInfo: LlmUserInfo) => `- Height: ${userInfo.height} cm
- Weight: ${userInfo.weight} kg
- Waist to Hip Ratio: ${userInfo.waistToHipRatio}
- Shoulder to Waist Ratio: ${userInfo.shoulderToWaistRatio}
- Target Weight: ${userInfo.targetWeight} kg
- Fitness Level: ${userInfo.fitnessLevel}
- Primary Fitness Goal: ${userInfo.primaryFitnessGoal}
- BodyFat Percent: ${userInfo.bodyFatPercent}
- Muscle Mass: ${userInfo.muscleMass}
- Lean Body Mass: ${userInfo.leanBodyMass}`;

export const FITNESS_SYSTEM_PROMPT = "You are a professional certified fitness coach.";
export const NUTRITION_SYSTEM_PROMPT = "You are a professional certified nutritionist.";

// Day 1 returns the whole plan scaffold (advices, week titles, brief analysis) plus a
// fully populated first day. Days 2-28 deliberately return only a lightweight day
// "container" with no exercises - those get filled in later, per day, by
// buildFitnessDayPrompt. That split is what keeps a 28-day generation affordable.
export const buildFitnessPlanPrompt = (userInfo: LlmUserInfo, dayNumber: number) => `Your task is to generate a JSON fitness plan for the given day number.

STRICT RULES:
- If dayNumber == 1 generate the FULL JSON object with ALL fields listed below.
- If dayNumber > 1 generate ONLY the \`day\` field (do NOT include briefAnalysis, advices, weekTitles, etc.).

User data:
${userBlock(userInfo)}

Day number: ${dayNumber}

---

### JSON FORMAT

If dayNumber == 1 use this format:

{
  "briefAnalysis": {
    "targetWeight": number,
    "fitnessLevel": string,
    "primaryFitnessGoal": string
  },
  "advices": {
    "nutrition": "string (at least 5 sentences)",
    "hydration": "string (at least 5 sentences)",
    "recovery": "string (at least 5 sentences)",
    "progress": "string (at least 5 sentences)"
  },
  "week1Title": "string",
  "week2Title": "string",
  "week3Title": "string",
  "week4Title": "string",
  "day": {
    "dayNumber": ${dayNumber},
    "day": "Upper Body Focus" | "Lower Body Focus" | "Rest Day / Active Recovery" | "Full Body & Core",
    "calories": number,
    "status": "Pending",
    "exercises": [
      {
        "imageUrl": "string",
        "status": "incompleted",
        "calories": number,
        "title": "string",
        "repeats": number | null,
        "time": number | null,
        "instruction": "string",
        "advices": "string"
      }
    ]
  }
}

If dayNumber > 1 use this format ONLY (no exercises - the type of day is chosen now and the exercises are added later):

{
  "day": {
    "day": "Upper Body Focus" | "Lower Body Focus" | "Rest Day / Active Recovery" | "Full Body & Core",
    "dayNumber": ${dayNumber},
    "status": "Pending"
  }
}

---

Additional strict rules:
- \`time\` must be in seconds.
- For dayNumber > 1, choose the type of day properly, as part of a coherent 28 day plan matched to the metrics above.
- Avoid repeating the same type three days in a row.
- Return ONLY valid JSON. No explanations, no comments, no extra text.`;

// Fills an existing day container with actual exercises. day/dayNumber are echoed back
// unchanged - the caller re-anchors them anyway, since the model is not authoritative
// about where the day sits in the plan.
export const buildFitnessDayPrompt = (userInfo: LlmUserInfo, day: { dayNumber: number; day: string }) => `Your task is to generate the exercises for one day of a fitness plan, as JSON.

User data:
${userBlock(userInfo)}

Day number: ${day.dayNumber}
Day type: ${day.day}

---

### JSON FORMAT

{
  "day": {
    "day": "${day.day}",
    "dayNumber": ${day.dayNumber},
    "calories": number,
    "status": "Pending",
    "exercises": [
      {
        "imageUrl": "string",
        "status": "incompleted",
        "calories": number,
        "title": "string",
        "repeats": number | null,
        "time": number | null,
        "instruction": "string",
        "advices": "string"
      }
    ]
  }
}

Rules:
- \`time\` must be in seconds.
- For each exercise: if \`repeats\` is not null then \`time\` must be null, and vice versa.
- \`calories\` inside \`day\` MUST equal the sum of all exercises' calories.
- Keep \`day\` and \`dayNumber\` exactly as given above - do not invent new values.
- Return ONLY valid JSON. No explanations, no comments, no extra text.`;

// NOTE: the original Python prompt placed "waterIntake" *outside* the JSON object it
// asked for, and left an unterminated quote in the "mealTitle" example. The backend
// reads day.waterIntake.current unconditionally, so a response that honoured the
// original layout literally would break meal/water tracking. Both are corrected here.
export const buildNutritionPrompt = (userInfo: LlmUserInfo, dayNumber: number) => `Generate a nutrition plan for one day only, as JSON.

User data:
${userBlock(userInfo)}

Day number: ${dayNumber}

Format JSON as:
{
  "dayNumber": ${dayNumber},
  "dailyGoals": {
    "calories": { "current": 0, "target": number },
    "protein": { "current": 0, "target": number },
    "carbs": { "current": 0, "target": number },
    "fats": { "current": 0, "target": number }
  },
  "waterIntake": {
    "current": 0,
    "target": number
  },
  "meals": [
    {
      "imageUrl": "string",
      "foodIntake": "Snack" | "Lunch" | "Breakfast" | "Dinner",
      "mealTitle": "string",
      "time": "HH:MM",
      "description": "string",
      "ingredients": ["string", "string"],
      "preparation": "string",
      "mealCalories": number,
      "mealProtein": number,
      "mealCarbs": number,
      "status": "pending",
      "mealFats": number
    }
  ]
}

Rules:
- "mealTitle" must be only the name of the dish, without words like "Breakfast".
- The sum of all meals' calories must equal dailyGoals.calories.target, and likewise for protein, carbs and fats.
- "waterIntake.target" is in millilitres.
- Return ONLY valid JSON. No explanations, no comments, no extra text.`;
