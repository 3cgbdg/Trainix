'use client';
import AnalyzedResults from '@/components/ai-analysis/AnalyzedResults';
import UploadPhoto from '@/components/ai-analysis/UploadPhoto';
import { useAppSelector } from '@/hooks/reduxHooks';
import { reportExtractFunc } from '@/utils/report';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

const Page = () => {
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const { user } = useAppSelector(state => state.auth)


    const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
    const sendPhoto = async (file: File) => {
        const formData = new FormData();
        formData.append("image", file);
        console.log("sdad1")
        console.log("user", user);
        const userInfo = {
            height: user?.metrics.height,
            weight: user?.metrics.weight,
            targetWeight: user?.targetWeight,
            primaryFitnessGoal: user?.primaryFitnessGoal,
            fitnessLevel: user?.fitnessLevel,
        }
        console.log("sdad2")

        formData.append("userInfo", JSON.stringify(userInfo));
        const res = await axios.post("http://127.0.0.1:8000/api", formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        });
        console.log("gello3");

        return res.data;
    }


    const mutation = useMutation({
        mutationFn: sendPhoto,
        onSuccess: async (data) => {
            setIsAnalyzed(true);
            try {
                await reportExtractFunc(data.AIreport);
            console.log("dasd");

            } catch (err) {
                console.error(err);
            }
            console.dir(data, { depth: null });
        },

    })
    return (

        <div className="">
            {!isAnalyzed ? <UploadPhoto isPending={mutation.isPending} file={file} fileName={fileName} setFile={setFile} mutate={mutation.mutate} setFileName={setFileName} />
                :
                <AnalyzedResults />
            }
        </div>
    );
}
export default Page;