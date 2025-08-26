"use client"
import { api } from '@/api/axiosInstance';
import GenerateNutritionPlan from '@/components/nutrition-plan/GenerateNutritionPlan';
import NutritionPlanPage from '@/components/nutrition-plan/NutritionPlanPage';
import { useAppSelector } from '@/hooks/reduxHooks';
import { reportExtractFunc } from '@/utils/report';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useCallback } from 'react';

const Page = () => {
    const { user } = useAppSelector(state => state.auth);
    const { nutritionDay } = useAppSelector(state => state.nutritionDay);
    const getMeasurements = async () => {
        const res = await api.get("/api/measurement/measurements");
        return res.data;
    }
    const { data: measurement, isLoading } = useQuery({
        queryKey: ["measurement"],
        queryFn: getMeasurements,
    })

    // mutation - request for generation plan
    const generateNutritionPlan = useCallback(async (dayNumber: number) => {
        if (!user) {
            return null;
        }
        const userInfo = {
            height: user.metrics.height,
            weight: user.metrics.weight,
            targetWeight: user.targetWeight,
            primaryFitnessGoal: user.primaryFitnessGoal,
            fitnessLevel: user.fitnessLevel,
            gender: user.gender,
            waistToHipRatio: measurement.waistToHipRatio,
            shoulderToWaistRatio: measurement.shoulderToWaistRatio,
            bodyFatPercent: measurement.bodyFatPercent,
            muscleMass: measurement.muscleMass,
            leanBodyMass: measurement.leanBodyMass,
            // days: ,
        }

        const res = await axios.post(`http://127.0.0.1:8000/api/nutrition?dayNumber=${dayNumber}`, userInfo, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
        });

        return res.data;
    }, [user, measurement]);
    const mutation = useMutation({
        mutationFn: generateNutritionPlan,
        onSuccess: async (data) => {
            await reportExtractFunc(data, "nutrition");

        },

        onError: (err: unknown) => {
            if (isAxiosError(err) && err.response) {
                console.error(err.response.data);
            }
        }

    })

    return (

        <div className="">
            {!isLoading ?
                (!nutritionDay && !mutation.isSuccess) ? <GenerateNutritionPlan mutateAsync={mutation.mutateAsync} isPending={mutation.isPending} />
                    :
                    <NutritionPlanPage day={nutritionDay!} />

                : <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green border-solid mx-auto mt-20"></div>}
        </div>
    );
}
export default Page;