import axios from "axios";

export const api = axios.create({
    // Browser requests stay on the Vercel origin and are proxied by Next.js.
    // This lets secure auth cookies work without relying on third-party cookies.
    baseURL: typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_URL : undefined,
    withCredentials: true,
})

let refreshRequest: Promise<unknown> | null = null;

api.interceptors.response.use(
    response => response,
    async error => {
        const originalReq = error.config;
        if (error.response?.status === 401 && originalReq && !originalReq._retry && !originalReq.url?.includes("/api/auth/refresh")) {
            originalReq._retry = true;
            try {
                refreshRequest ??= api.post("/api/auth/refresh").finally(() => {
                    refreshRequest = null;
                });
                await refreshRequest;
                return api(originalReq);
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
)
