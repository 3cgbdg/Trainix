"use client"
import { api } from '@/api/axiosInstance';
import AnalyzedResults from '@/components/ai-analysis/AnalyzedResults';
import UploadPhoto from '@/components/ai-analysis/UploadPhoto';
import GenerateNutritionPlan from '@/components/nutrition-plan/GenerateNutritionPlan';
import { useAppSelector } from '@/hooks/reduxHooks';
import { reportExtractFunc } from '@/utils/report';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

const Page = () => {
    const { user } = useAppSelector(state => state.auth)

    const getMeasurements = async () => {
        const res = await api.get("/api/measurement/measurements");
        return res.data;
    }
    const { data: measurement, isLoading } = useQuery({
        queryKey: ["measurement"],
        queryFn: getMeasurements,
    })

// mutation - request for generation plan
    const generateNutritionPlan = async () => {
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
        }

        const res = await axios.post("http://127.0.0.1:8000/api/nutrition",userInfo , {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
        });

        return res.data;
    }
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
    
    // const getAnalysis = async () => {
    //     const res = await api.get("api/nutrition-plan/nutrition-plans");
        
    //     return res.data;
    // }


    // const { data:nutritionPlanData } = useQuery({
    //     queryKey: ["getAnalysis"],
    //     queryFn: getAnalysis,


    // })
    return (

        <div className="">
            {(!mutation.data && !mutation.isSuccess) ? <GenerateNutritionPlan  mutate={mutation.mutate} isPending={mutation.isPending}/>
                :
                <AnalyzedResults data={mutation.data} />
            }
        </div>
    );
}
export default Page;