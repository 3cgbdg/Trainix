"use client"
import { api } from '@/api/axiosInstance';
import AnalyzedResults from '@/components/ai-analysis/AnalyzedResults';
import UploadPhoto from '@/components/ai-analysis/UploadPhoto';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { getMeasurement } from '@/redux/measurementSlice';
import { reportExtractFunc } from '@/utils/report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
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
    const getAnalysis = useCallback(async () => {
        const res = await api.get("api/fitness-plan/analysis");
        return res.data;
    }, []);
    const { data, isLoading } = useQuery({
        queryKey: ["getAnalysis"],
        queryFn: getAnalysis,
        refetchOnWindowFocus: false,
        retry: 0,

    })



    // mutation - request for generation plan
    const generateFitnessPlan = useCallback(async ({ dayNumber, measurement }: { dayNumber: number, measurement: any }) => {
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

        const res = await axios.post(`http://127.0.0.1:8000/api/fitnessPlan?dayNumber=${dayNumber + 1}`, userInfo, {
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

        onError: (err: unknown) => {
            if (isAxiosError(err) && err.response) {
                console.error(err.response.data);
            }
        }

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
        const res = await axios.post("http://127.0.0.1:8000/api/photo-analyze", formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        });

        return res.data;
    }, [user]);

    const mutation1 = useMutation({
        mutationFn: sendPhoto,
        onSuccess: async (data) => {
            const measurement = await reportExtractFunc(data, "measurement");
            dispatch(getMeasurement(measurement));
            for (let i = 0; i < 28; i++) {
                await mutation2.mutateAsync({ dayNumber: i, measurement });

            }
            queryClient.invalidateQueries({ queryKey: ['getAnalysis'] });
            setIsAnalyzed(true);

        },
        onError: (err: unknown) => {
            if (isAxiosError(err) && err.response) {
                console.error(err.response.data);
            }
        }

    })
    //request func to python api for creating plan 
    if (isLoading) {
        return <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green mx-auto mt-20"></div>;
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