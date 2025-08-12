import { api } from "@/api/axiosInstance";

type AiDataType = {
    AIreport:string,
    imageUrl:string,
}

export const reportExtractFunc = async(data:AiDataType) => {
    const regex = /```json\s([\s\S]+?)```/;  
    console.log("1");

    let match = data.AIreport.match(regex);

    console.log("2");
    try{
    console.log("3");

    await api.post(`/api/fitness-plan/reports`,{data:match ? JSON.parse(match[1]): JSON.parse(data.AIreport),imageUrl:data.imageUrl});
    console.log("Report created!");
    }catch(err){
        console.error(err);
    }
}   