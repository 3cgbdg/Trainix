"use client"
import { api } from '@/api/axiosInstance';
import GenerateNutritionPlan from '@/components/nutrition-plan/GenerateNutritionPlan';
import NutritionPlanPage from '@/components/nutrition-plan/NutritionPlanPage';
import { ErrorState, Spinner } from '@/components/ui/Feedback';
import { Surface } from '@/components/ui/Surface';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { getNutritionDay } from '@/redux/nutritionDaySlice';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { isMeasurementPayload, isNutritionDayPayload } from '@/lib/apiGuards';

const Page = () => {
    const { user } = useAppSelector(state => state.auth);
    const { nutritionDay } = useAppSelector(state => state.nutritionDay);
    const dispatch = useAppDispatch();
    const getMeasurements = async (signal?: AbortSignal) => {
        const res = await api.get("/api/measurement/measurements", { signal });
        return res.data;
    }
    const { data: measurement, isLoading, error: measurementQueryError, refetch } = useQuery({
        queryKey: ["measurement"],
        queryFn: ({ signal }) => getMeasurements(signal),
        enabled: Boolean(user),
        retry: 0,
    })
    const measurementError = Boolean(measurementQueryError);

    // The backend now owns the whole flow: it reads the user's metrics itself, calls
    // the AI service, parses the response, and persists the day - so the client just
    // asks for a day number and gets back the saved result.
    const generateNutritionPlan = useCallback(async (dayNumber: number) => {
        if (!user || !isMeasurementPayload(measurement)) throw new Error("A valid body measurement is required");
        const res = await api.post(`/api/nutrition-plan/nutrition-plans/generate?dayNumber=${dayNumber}`);
        return res.data;
    }, [user, measurement]);
    const mutation = useMutation({
        mutationFn: generateNutritionPlan,
        onSuccess: (data) => {
            if (!isNutritionDayPayload(data?.day)) throw new Error("The nutrition service returned an invalid meal plan");
            dispatch(getNutritionDay(data.day));
        },
    })

    if (!user || isLoading) {
        return <div className="flex min-h-80 items-center justify-center"><Spinner label="Loading your nutrition profile" /></div>;
    }

    if (measurementError) {
        return <Surface><ErrorState title="We could not load your measurements" description="Your measurements are needed to personalize calories and macros." onRetry={() => void refetch()} /></Surface>;
    }

    if (mutation.isError) {
        return <Surface><ErrorState title="Your meal plan could not be created" description="Nothing was saved. Check the nutrition service and try again." onRetry={() => mutation.reset()} /></Surface>;
    }

    return !nutritionDay ?
        <GenerateNutritionPlan mutate={mutation.mutate} isPending={mutation.isPending} /> :
        <NutritionPlanPage day={nutritionDay} />;
}
export default Page;
