import type { IMetrics, IMeasurements } from "@/types/types";
import type { IWorkouts } from "@/redux/workoutsSlice";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export function isWorkoutsPayload(value: unknown): value is IWorkouts {
  return isRecord(value) && Array.isArray(value.items) && Array.isArray(value.dates);
}

export function isNutritionDayPayload(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.dailyGoals) || !isRecord(value.waterIntake)) return false;
  const goals = value.dailyGoals;
  return Array.isArray(value.meals)
    && isRecord(goals.calories)
    && isRecord(goals.protein)
    && isRecord(goals.carbs)
    && isRecord(goals.fats);
}

export function isMetricsPayload(value: unknown): value is IMetrics {
  return isRecord(value)
    && Number.isFinite(value.height)
    && Number.isFinite(value.weight)
    && Number.isFinite(value.bodyFatPercent)
    && Number.isFinite(value.leanBodyMass);
}

export function isMeasurementPayload(value: unknown): value is IMeasurements {
  return isRecord(value) && isMetricsPayload(value.metrics) && typeof value.imageUrl === "string";
}
