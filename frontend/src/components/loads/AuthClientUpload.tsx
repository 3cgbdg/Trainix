"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api, suspendSessionRefresh } from "@/api/axiosInstance";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { getProfile, logOut } from "@/redux/authSlice";
import { clearMeasurement, getMeasurement } from "@/redux/measurementSlice";
import { clearNutritionDay, getNutritionDay } from "@/redux/nutritionDaySlice";
import { getWorkouts } from "@/redux/workoutsSlice";
import { isEmptyMeasurementPayload, isMeasurementPayload, isNutritionDayPayload, isWorkoutsPayload } from "@/lib/apiGuards";
import type { IUser } from "@/types/types";

let profileBootstrapRequest: ReturnType<typeof api.get<{ user: IUser }>> | null = null;

function getAuthenticatedProfile() {
  if (!profileBootstrapRequest) {
    const request = api.get<{ user: IUser }>("/api/auth/profile");
    profileBootstrapRequest = request;
    request.then(
      () => { if (profileBootstrapRequest === request) profileBootstrapRequest = null; },
      () => { if (profileBootstrapRequest === request) profileBootstrapRequest = null; },
    );
  }
  return profileBootstrapRequest;
}

export default function AuthClientUpload() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    async function loadAuthenticatedData() {
      // Resolve or refresh the cookie-backed session once before starting the
      // authenticated fan-out. This keeps late 401 responses from starting a
      // second refresh wave when the access token expires.
      let profile;
      try {
        profile = await getAuthenticatedProfile();
      } catch {
        if (cancelled) return;
        queryClient.clear();
        dispatch(logOut());
        // clear the httpOnly session cookies server-side — otherwise proxy.ts's
        // presence-only check keeps treating this as an authenticated request
        // and redirects straight back to a protected route, looping forever
        suspendSessionRefresh();
        try { await api.delete("/api/auth/logout"); } catch { /* best-effort */ }
        router.replace("/auth/login");
        return;
      }

      if (cancelled) return;
      dispatch(getProfile(profile.data.user));

      const [measurement, workouts, nutrition] = await Promise.allSettled([
        api.get("api/measurement/measurements"),
        api.get("/api/fitness-plan/workouts"),
        api.get("api/nutrition-plan/nutrition-plans"),
      ]);

      if (cancelled) return;

      if (measurement.status === "fulfilled") {
        if (isMeasurementPayload(measurement.value.data)) dispatch(getMeasurement(measurement.value.data));
        else if (isEmptyMeasurementPayload(measurement.value.data)) dispatch(clearMeasurement());
      }
      if (workouts.status === "fulfilled" && isWorkoutsPayload(workouts.value.data)) dispatch(getWorkouts(workouts.value.data));
      if (nutrition.status === "fulfilled") {
        if (isNutritionDayPayload(nutrition.value.data)) dispatch(getNutritionDay(nutrition.value.data));
        else if (nutrition.value.data?.hasCurrentDay === false) dispatch(clearNutritionDay());
      }
    }

    void loadAuthenticatedData();

    return () => {
      cancelled = true;
    };
  }, [dispatch, queryClient, router]);

  return null;
}
