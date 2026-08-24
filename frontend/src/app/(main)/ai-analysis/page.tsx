"use client"
import { api } from '@/api/axiosInstance';
import AnalyzedResults from '@/components/ai-analysis/AnalyzedResults';
import type { ReceivedAnalysis } from '@/components/ai-analysis/AnalyzedResults';
import UploadPhoto from '@/components/ai-analysis/UploadPhoto';
import { Spinner } from '@/components/ui/Feedback';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { getMeasurement } from '@/redux/measurementSlice';
import { getWorkouts } from '@/redux/workoutsSlice';
import { IMetrics } from '@/types/types';
import { reportExtractFunc } from '@/utils/report';
import { isMeasurementPayload, isWorkoutsPayload } from '@/lib/apiGuards';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useState } from 'react';

const Page = () => {
    const queryClient = useQueryClient();
    const [reset, setReset] = useState<boolean>(false);
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const { user } = useAppSelector(state => state.auth)
    const [isAnalyzed, setIsAnalyzed] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    // getting ai-analyzed  data
    const getAnalysis = useCallback(async (signal?: AbortSignal) => {
        const res = await api.get("/api/fitness-plan/analysis", { signal });
        return res.data;
    }, []);
    const { data, isLoading } = useQuery<ReceivedAnalysis>({
        queryKey: ["getAnalysis"],
        queryFn: ({ signal }) => getAnalysis(signal),
        enabled: Boolean(user),
        refetchOnWindowFocus: false,
        retry: 0,
    })



    // mutation - request for generation plan
    const generateFitnessPlan = useCallback(async ({ dayNumber, measurement }: { dayNumber: number, measurement: IMetrics }) => {
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

        const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL;
        if (!pythonApiUrl) throw new Error("Fitness analysis service is not configured");
        const res = await axios.post(`${pythonApiUrl}/api/fitnessPlan?dayNumber=${dayNumber + 1}`, userInfo, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
        });

        return res.data;
    }, [user]);

    const mutation2 = useMutation({
        mutationFn: generateFitnessPlan,
        onSuccess: async (data) => {
            await reportExtractFunc(data, "fitness-container");


        },
    })
    // request func fro sending photo to python api  
    const sendPhoto = useCallback(async (file: File) => {
        const formData = new FormData();
        if (!user) {
            return null;
        }
        formData.append("image", file);
        const userInfo = {
            height: user.metrics.height,
            weight: user.metrics.weight,
            targetWeight: user.targetWeight,
            primaryFitnessGoal: user.primaryFitnessGoal,
            fitnessLevel: user.fitnessLevel,
            gender: user.gender,
        }

        formData.append("userInfo", JSON.stringify(userInfo));
        const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL;
        if (!pythonApiUrl) throw new Error("Photo analysis service is not configured");
        const res = await axios.post(`${pythonApiUrl}/api/photo-analyze`, formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        });

        return res.data;
    }, [user]);

    const mutation1 = useMutation({
        mutationFn: sendPhoto,
        onSuccess: async (data) => {
            const measurement = await reportExtractFunc(data, "measurement");
            if (!isMeasurementPayload(measurement)) throw new Error("The analysis service returned invalid body metrics.");
            dispatch(getMeasurement(measurement));
            await mutation2.mutateAsync({ dayNumber: 0, measurement: measurement.metrics });
            const batchSize = 4;
            for (let start = 1; start < 28; start += batchSize) {
                const end = Math.min(start + batchSize, 28);
                await Promise.all(Array.from({ length: end - start }, (_, offset) =>
                    mutation2.mutateAsync({ dayNumber: start + offset, measurement: measurement.metrics })
                ));
            }
            queryClient.invalidateQueries({ queryKey: ['getAnalysis'] });
            const res2 = await api.get(`/api/fitness-plan/workouts`);
            if (isWorkoutsPayload(res2.data)) dispatch(getWorkouts(res2.data));
            setIsAnalyzed(true);

        },
        onError: () => setIsAnalyzed(true),

    })
    //request func to python api for creating plan 
    if (!user || isLoading) {
        return <div className="flex min-h-80 items-center justify-center"><Spinner label="Loading your latest body analysis" /></div>;
    }

    if (!data?.advices || !isAnalyzed || reset) {
        return (
            <UploadPhoto
                setReset={setReset}
                isAnalyzed={isAnalyzed}
                setIsAnalyzed={setIsAnalyzed}
                file={file}
                fileName={fileName}
                setFile={setFile}
                setFileName={setFileName}
                mutation={mutation1}
            />
        );
    }

    return <AnalyzedResults setReset={setReset} data={data} />;
}
export default Page;
