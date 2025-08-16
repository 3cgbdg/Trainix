import { api } from "@/api/axiosInstance";

type AiDataType = {
    AIreport: string,
    imageUrl: string,
}

export const reportExtractFunc = async (data: AiDataType, method: "nutrition" | "fitness") => {
    const regex = /```json\s([\s\S]+?)```/;

    let match = data.AIreport.match(regex);

    try {
        if (method == "nutrition") {
            await api.post(`/api/nutrition-plan/reports`, { data: match ? JSON.parse(match[1]) : JSON.parse(data.AIreport) });
        } else {
            await api.post(`/api/fitness-plan/reports`, { data: match ? JSON.parse(match[1]) : JSON.parse(data.AIreport), imageUrl: data.imageUrl });

        }
        console.log("Report created!");
    } catch (err) {
        console.error(err);
    }
}   