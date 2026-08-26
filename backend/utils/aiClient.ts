import axios from "axios";

// Talks to the Python CV service, which is now down to a single endpoint:
// /api/photo-analyze (mediapipe pose estimation). Plan and nutrition generation were
// never CV - they were plain chat completions that happened to live in Python because
// that's where the OpenAI SDK was installed - and now run in-process via
// utils/aiGeneration.ts.
const AI_REQUEST_TIMEOUT_MS = 120_000;

export class AiServiceError extends Error {
    constructor(message: string, readonly status?: number) {
        super(message);
        this.name = "AiServiceError";
    }
}

const baseUrl = (): string => {
    const url = process.env.PYTHON_API_URL;
    if (!url) throw new AiServiceError("AI service is not configured (PYTHON_API_URL is unset).");
    return url.replace(/\/$/, "");
};

// Identifies this backend to the AI service so it can refuse anything that
// didn't come from us. Optional on our side - if it's unset we simply don't send
// the header, which keeps local dev and the existing deployment working until
// the Python service starts requiring it.
const authHeaders = (): Record<string, string> => {
    const secret = process.env.AI_SERVICE_SECRET;
    return secret ? { "x-ai-service-secret": secret } : {};
};

// /api/photo-analyze returns AIreport as an already-parsed object, so this is mostly
// a passthrough now. The string handling stays as defence-in-depth: the four callers
// that used to regex fences out of model prose each had their own stricter variant
// (one required exactly one whitespace character after the fence), so a harmless
// formatting change could break one path and not another. Generation no longer relies
// on it at all - it asks the model for json_object mode, which cannot emit a fence.
const FENCE = /```(?:json)?\s*([\s\S]+?)```/i;

export const parseAiReport = <T = any>(aiReport: unknown): T => {
    if (aiReport && typeof aiReport === "object") return aiReport as T;
    if (typeof aiReport !== "string") {
        throw new AiServiceError("AI service returned no report.");
    }
    const match = aiReport.match(FENCE);
    const raw = match ? match[1] : aiReport;
    try {
        return JSON.parse(raw) as T;
    } catch {
        throw new AiServiceError("AI service returned a malformed report.");
    }
};

type CallOptions = { query?: Record<string, string | number> };

const buildUrl = (path: string, query?: CallOptions["query"]): string => {
    const url = new URL(`${baseUrl()}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) {
        url.searchParams.set(key, String(value));
    }
    return url.toString();
};

const toAiServiceError = (err: unknown): AiServiceError => {
    if (err instanceof AiServiceError) return err;
    if (axios.isAxiosError(err)) {
        // the Python service reports failures as { detail: string }
        const detail = err.response?.data?.detail;
        return new AiServiceError(
            typeof detail === "string" ? detail : "The AI service is unavailable. Please try again.",
            err.response?.status,
        );
    }
    return new AiServiceError("The AI service is unavailable. Please try again.");
};

export type PhotoAnalysisResult = { metrics: unknown; imageUrl: string };

// The only call left to the Python service. Everything else it used to serve was a
// plain chat completion and now runs in-process (see utils/aiGeneration.ts); this one
// stays because it needs mediapipe pose estimation, which has no Node equivalent.
export const requestPhotoAnalysis = async (
    file: { buffer: Buffer; mimetype: string; originalname: string },
    userInfo: unknown,
): Promise<PhotoAnalysisResult> => {
    try {
        const form = new FormData();
        form.append("image", new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
        form.append("userInfo", JSON.stringify(userInfo));

        const res = await axios.post(buildUrl("/api/photo-analyze"), form, {
            headers: authHeaders(),
            timeout: AI_REQUEST_TIMEOUT_MS,
        });
        return {
            metrics: parseAiReport(res.data?.AIreport),
            imageUrl: res.data?.imageUrl,
        };
    } catch (err) {
        throw toAiServiceError(err);
    }
};
