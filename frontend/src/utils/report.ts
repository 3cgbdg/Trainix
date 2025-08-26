import { api } from "@/api/axiosInstance";

type AiDataType = {
    AIreport: string,
    imageUrl: string,
}

export const reportExtractFunc = async (data: AiDataType, method: "nutrition" | "fitness" | "measurement") => {
    const regex = /```json\s([\s\S]+?)```/;
    let match;
    if (method !== "measurement") {
         match = data.AIreport.match(regex);
    }
    try {

        if (method == "nutrition") {
            await api.post(`/api/nutrition-plan/nutrition-plans/days`, { data: match ? JSON.parse(match[1]) : JSON.parse(data.AIreport) });
            return;
        } else if (method == "fitness") {
            await api.post(`/api/fitness-plan/days`, { data: match ? JSON.parse(match[1]) : JSON.parse(data.AIreport) });
            return;
        } else {

            await api.post(`/api/measurement/measurements`, { metrics: data.AIreport, imageUrl: data.imageUrl });
            return data.AIreport;

        }
    } catch (err) {
        console.error(err);
    }
}   