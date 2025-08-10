import { api } from "@/api/axiosInstance";

export const reportExtractFunc = async(report:string) => {
    const regex = /```json\s([\s\S]+?)```/;  
    const match = report.match(regex);
    if (!match) return null;
    try{
    await api.post(`/api/fitness-plan/reports`,{data:JSON.parse(match[1])});
    console.log("Report created!");
    }catch(err){
        console.error(err);
    }
}