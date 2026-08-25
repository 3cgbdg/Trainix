"use client"
import { api } from '@/api/axiosInstance';
import AnalyzedResults from '@/components/ai-analysis/AnalyzedResults';
import type { ReceivedAnalysis } from '@/components/ai-analysis/AnalyzedResults';
import UploadPhoto from '@/components/ai-analysis/UploadPhoto';
import { Spinner } from '@/components/ui/Feedback';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { getMeasurement } from '@/redux/measurementSlice';
import { getWorkouts } from '@/redux/workoutsSlice';
import { reportExtractFunc } from '@/utils/report';
import { isMeasurementPayload, isWorkoutsPayload } from '@/lib/apiGuards';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { io } from 'socket.io-client';

const Page = () => {
    const queryClient = useQueryClient();
    const [reset, setReset] = useState<boolean>(false);
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const { user } = useAppSelector(state => state.auth)
    const [isAnalyzed, setIsAnalyzed] = useState<boolean>(true);
    const [progress, setProgress] = useState<{ day: number; total: number } | null>(null);
    const dispatch = useAppDispatch();

    // getting ai-analyzed  data
    const getAnalysis = useCallback(async () => {
        const res = await api.get("/api/fitness-plan/analysis");
        return res.data;
    }, []);
    const { data, isLoading } = useQuery<ReceivedAnalysis>({
        queryKey: ["getAnalysis"],
        queryFn: getAnalysis,
        refetchOnWindowFocus: false,
        retry: 0,
    })

    // the 28-day plan is generated entirely server-side now (see generateFitnessPlan /
    // runFitnessPlanGeneration on the backend) instead of the client making 28 sequential
    // round trips. This just watches the socket for progress and the final signal, with an
    // idle timeout as a safety net in case a socket event never arrives.
    const waitForPlanGeneration = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) { reject(new Error("API is not configured")); return; }
            const IDLE_LIMIT_MS = 90_000;
            let socket: ReturnType<typeof io> | undefined;
            let settled = false;
            let idleTimer: ReturnType<typeof setTimeout>;

            const cleanup = () => { clearTimeout(idleTimer); socket?.off(); socket?.disconnect(); };
            const finish = (fn: () => void) => { if (settled) return; settled = true; cleanup(); fn(); };
            const resetIdleTimer = () => {
                clearTimeout(idleTimer);
                idleTimer = setTimeout(() => finish(() => reject(new Error("Plan generation is taking too long. Please try again."))), IDLE_LIMIT_MS);
            };

            api.get("/api/auth/socket-token").then(({ data }) => {
                if (settled) return;
                socket = io(apiUrl, { auth: { token: data.token } });
                resetIdleTimer();
                socket.on("fitnessPlanProgress", (payload: { day: number; total: number }) => {
                    setProgress(payload);
                    resetIdleTimer();
                });
                socket.on("fitnessPlanReady", () => finish(resolve));
                socket.on("fitnessPlanError", (payload: { message?: string }) => finish(() => reject(new Error(payload?.message ?? "Plan generation failed."))));
            }).catch((err) => finish(() => reject(err)));
        });
    }, []);

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
            setProgress({ day: 0, total: 28 });
            await api.post("/api/fitness-plan/generate");
            await waitForPlanGeneration();
            queryClient.invalidateQueries({ queryKey: ['getAnalysis'] });
            // the dashboard and progress pages read the same numbers through their own
            // separately cached queries, which a new body scan + plan doesn't otherwise
            // touch - without this they can keep showing pre-scan numbers until their 30s
            // staleTime happens to expire
            queryClient.invalidateQueries({ queryKey: ['dashboard-numbers'] });
            queryClient.invalidateQueries({ queryKey: ['progress'] });
            const res2 = await api.get(`/api/fitness-plan/workouts`);
            if (isWorkoutsPayload(res2.data)) dispatch(getWorkouts(res2.data));
            setIsAnalyzed(true);
            setProgress(null);

        },
        onError: async () => {
            setIsAnalyzed(true);
            setProgress(null);
            // a failure partway through generation can still have saved several days
            // server-side - refresh cached state so the UI reflects what actually happened
            // instead of the stale pre-generation data, which otherwise only a manual page
            // reload would pick up
            queryClient.invalidateQueries({ queryKey: ['getAnalysis'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-numbers'] });
            queryClient.invalidateQueries({ queryKey: ['progress'] });
            try {
                const res2 = await api.get(`/api/fitness-plan/workouts`);
                if (isWorkoutsPayload(res2.data)) dispatch(getWorkouts(res2.data));
            } catch { /* best effort */ }
        },

    })
    //request func to python api for creating plan
    if (isLoading) {
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
                progress={progress}
            />
        );
    }

    return <AnalyzedResults setReset={setReset} data={data} />;
}
export default Page;
