import { IDayPlan } from "../models/FitnessPlan";
import { IDayPlanNutrition } from "../models/NutritionPlan";
import { generateJson } from "./llmClient";
import {
    buildFitnessDayPrompt,
    buildFitnessPlanPrompt,
    buildNutritionPrompt,
    FITNESS_SYSTEM_PROMPT,
    LlmUserInfo,
    NUTRITION_SYSTEM_PROMPT,
} from "./prompts";

// The three generation calls that used to be HTTP round trips to the Python service.
// Same prompts, same model - they just no longer leave the process.

export type FitnessPlanScaffold = {
    day: IDayPlan;
    week1Title?: string;
    week2Title?: string;
    week3Title?: string;
    week4Title?: string;
    advices?: unknown;
    briefAnalysis?: unknown;
};

export const generateFitnessPlanDay = (userInfo: LlmUserInfo, dayNumber: number) =>
    generateJson<FitnessPlanScaffold>({
        system: FITNESS_SYSTEM_PROMPT,
        prompt: buildFitnessPlanPrompt(userInfo, dayNumber),
    });

export const generateFitnessDayExercises = (userInfo: LlmUserInfo, day: { dayNumber: number; day: string }) =>
    generateJson<{ day: IDayPlan }>({
        system: FITNESS_SYSTEM_PROMPT,
        prompt: buildFitnessDayPrompt(userInfo, day),
    });

export const generateNutritionPlanDay = (userInfo: LlmUserInfo, dayNumber: number) =>
    generateJson<IDayPlanNutrition>({
        system: NUTRITION_SYSTEM_PROMPT,
        prompt: buildNutritionPrompt(userInfo, dayNumber),
    });

// builds the metric bundle every prompt takes, from the two documents that carry it
export const toLlmUserInfo = (
    user: { metrics?: { height?: number; weight?: number }; targetWeight?: number; primaryFitnessGoal?: string; fitnessLevel?: string; gender?: string } | null,
    measurement: { metrics: { waistToHipRatio?: number; shoulderToWaistRatio?: number; bodyFatPercent?: number; muscleMass?: number; leanBodyMass?: number } } | null,
): LlmUserInfo => ({
    height: user?.metrics?.height,
    weight: user?.metrics?.weight,
    targetWeight: user?.targetWeight,
    primaryFitnessGoal: user?.primaryFitnessGoal,
    fitnessLevel: user?.fitnessLevel,
    gender: user?.gender,
    waistToHipRatio: measurement?.metrics.waistToHipRatio,
    shoulderToWaistRatio: measurement?.metrics.shoulderToWaistRatio,
    bodyFatPercent: measurement?.metrics.bodyFatPercent,
    muscleMass: measurement?.metrics.muscleMass,
    leanBodyMass: measurement?.metrics.leanBodyMass,
});
