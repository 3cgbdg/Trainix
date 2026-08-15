"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/api/axiosInstance";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { finishAuth, getProfile } from "@/redux/authSlice";
import { getMeasurement } from "@/redux/measurementSlice";
import { getNutritionDay } from "@/redux/nutritionDaySlice";
import { getWorkouts } from "@/redux/workoutsSlice";
import { isMeasurementPayload, isNutritionDayPayload, isWorkoutsPayload } from "@/lib/apiGuards";

export default function AuthClientUpload() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadAuthenticatedData() {
      try {
        const profile = await api.get("/api/auth/profile");
        if (cancelled) return;
        dispatch(getProfile(profile.data.user));
      } catch {
        if (!cancelled) dispatch(finishAuth());
        router.replace("/auth/login");
        return;
      }

      const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL;
      if (pythonUrl) {
        void axios.get(`${pythonUrl}/api/ping`, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }).catch(() => undefined);
      }

      const [measurement, workouts, nutrition] = await Promise.allSettled([
        api.get("api/measurement/measurements"),
        api.get("/api/fitness-plan/workouts"),
        api.get("api/nutrition-plan/nutrition-plans"),
      ]);

      if (cancelled) return;
      if (measurement.status === "fulfilled" && isMeasurementPayload(measurement.value.data)) dispatch(getMeasurement(measurement.value.data));
      if (workouts.status === "fulfilled" && isWorkoutsPayload(workouts.value.data)) dispatch(getWorkouts(workouts.value.data));
      if (nutrition.status === "fulfilled" && isNutritionDayPayload(nutrition.value.data)) dispatch(getNutritionDay(nutrition.value.data));
    }

    void loadAuthenticatedData();

    return () => {
      cancelled = true;
    };
  }, [dispatch, router]);

  return null;
}
