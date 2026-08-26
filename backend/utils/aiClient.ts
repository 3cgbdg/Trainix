import axios from "axios";

// Single place that talks to the Python AI/CV service. Everything that needs AI
// content goes through here so that:
//   - the service URL and the shared secret live in exactly one place
//   - the "extract JSON out of the model's prose" logic exists once instead of
//     being re-implemented (slightly differently) at every call site
//   - the browser never needs to reach the Python service directly
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

// The model is asked for JSON but replies with prose that *contains* JSON, usually
// inside a markdown fence. Accepts ```json / ```JSON / a bare ``` fence / no fence
// at all - previously four call sites each had their own stricter variant of this
// (one of which required exactly one whitespace character after the fence), so a
// harmless formatting change from the model could break one path but not another.
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

// Posts a JSON body and returns the parsed report from the { AIreport } envelope.
export const requestAiReport = async <T = any>(path: string, body: unknown, options: CallOptions = {}): Promise<T> => {
    try {
        const res = await axios.post(buildUrl(path, options.query), body, {
            headers: { "Content-Type": "application/json", ...authHeaders() },
            timeout: AI_REQUEST_TIMEOUT_MS,
        });
        return parseAiReport<T>(res.data?.AIreport);
    } catch (err) {
        throw toAiServiceError(err);
    }
};

export type PhotoAnalysisResult = { metrics: unknown; imageUrl: string };

// Forwards an already-validated image to the CV service. Kept separate from
// requestAiReport because this is the one endpoint that is multipart, and the one
// whose response carries an imageUrl alongside the report.
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
