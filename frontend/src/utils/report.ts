import { api } from "@/api/axiosInstance";
import { IMeasurements } from "@/types/types";

type AiDataType = {
    AIreport: string,
    imageUrl: string,
}

export const reportExtractFunc = async (data: AiDataType, method: "nutrition" | "fitness-container" |"fitness-day" | "measurement") => {
    const regex = /```json\s([\s\S]+?)```/;
    let match;
    try {
        if (method !== "measurement") {
            match = data.AIreport.match(regex);
            const info = match ? JSON.parse(match[1]) : JSON.parse(data.AIreport);
            if (method == "nutrition") {
                const res = await api.post(`/api/nutrition-plan/nutrition-plans/days`, { data: info });
                return res.data;
            } else if (method == "fitness-container") {
                await api.post(`/api/fitness-plan/days?method=container`, { data: info });
                return;
            }else{
                const res = await api.post(`/api/fitness-plan/days`, { data: info });
                return res.data.day;
            }
        } else {
            const info =typeof data.AIreport=="string" ? JSON.parse(data.AIreport) : data.AIreport;
            await api.post(`/api/measurement/measurements`, { metrics: info, imageUrl: data.imageUrl });
            return info;

        }
    } catch (err) {
        console.error(err);
    }
}   