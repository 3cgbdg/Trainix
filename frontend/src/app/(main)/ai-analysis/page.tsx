"use client"
import { api } from '@/api/axiosInstance';
import AnalyzedResults from '@/components/ai-analysis/AnalyzedResults';
import UploadPhoto from '@/components/ai-analysis/UploadPhoto';
import { useAppSelector } from '@/hooks/reduxHooks';
import { reportExtractFunc } from '@/utils/report';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useState } from 'react';

const Page = () => {
    const queryClient = useQueryClient()
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const { user } = useAppSelector(state => state.auth)


    const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
    const sendPhoto = async (file: File) => {
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
    }




    const getAnalysis = async () => {
        const res = await api.get("api/fitness-plan/analysis");
        return res.data;
    }
    const mutation = useMutation({
        mutationFn: sendPhoto,
        onSuccess: async (data) => {
            await reportExtractFunc(data,"fitness");
            await queryClient.invalidateQueries({queryKey:["getAnalysis"]});
            setIsAnalyzed(true);
        },
        onError: (err: unknown) => {
            if (isAxiosError(err) && err.response) {
                console.error(err.response.data);
            }
        }

    })

    const { data } = useQuery({
        queryKey: ["getAnalysis"],
        queryFn: getAnalysis,


    })
    return (

        <div className="">
            {(!data?.advices && !isAnalyzed) ? <UploadPhoto isPending={mutation.isPending} file={file} fileName={fileName} setFile={setFile} mutate={mutation.mutate} setFileName={setFileName} />
                :
                <AnalyzedResults data={data} />
            }
        </div>
    );
}
export default Page;