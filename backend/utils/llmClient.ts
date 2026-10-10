import axios from "axios";
import { AiServiceError } from "./aiClient";

// Plan/nutrition generation used to live in the Python service purely because that's
// where the OpenAI SDK happened to be installed - those endpoints did no CV work, just
// an f-string prompt and a chat completion. They run here now, next to the data they
// describe. The Python service keeps only /api/photo-analyze, which genuinely needs
// mediapipe.
//
// This calls the REST API over axios rather than pulling in the openai SDK. The SDK's
// current major declares peer dependencies on @aws-sdk/credential-provider-node
// >=3.972 and @smithy/* (for its Bedrock support), which collide with the
// @aws-sdk/client-s3@3.864 tree this project pins - installing it makes `npm ci`
// refuse the lockfile. Older majors want ws ^8.18 against a pinned ws@8.17. Since this
// is a single non-streaming POST and axios is already a dependency, the SDK earns
// nothing here but dependency conflicts.
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.7;
const REQUEST_TIMEOUT_MS = 120_000;

type GenerateOptions = {
    system: string;
    prompt: string;
    temperature?: number;
};

type ChatCompletionResponse = {
    choices?: Array<{ message?: { content?: string | null } }>;
};

// Asks for JSON and gets JSON. response_format json_object is what makes this
// reliable: the previous setup only *asked* the model for raw JSON in prose, so it
// habitually wrapped the answer in a ```json fence that four different call sites
// then had to regex back out. The model cannot emit a fence in this mode.
export const generateJson = async <T = any>({ system, prompt, temperature }: GenerateOptions): Promise<T> => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new AiServiceError("AI generation is not configured (OPENAI_API_KEY is unset).");
    }

    let content: string | null | undefined;
    try {
        const res = await axios.post<ChatCompletionResponse>(
            OPENAI_URL,
            {
                model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
                temperature: temperature ?? DEFAULT_TEMPERATURE,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: prompt },
                ],
            },
            {
                headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
                timeout: REQUEST_TIMEOUT_MS,
            },
        );
        content = res.data?.choices?.[0]?.message?.content;
    } catch (err) {
        // never let the key reach a log line - axios errors carry the request headers
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        console.error(`LLM generation failed${status ? ` (HTTP ${status})` : ""}`);
        throw new AiServiceError("The AI service is unavailable. Please try again.");
    }

    if (!content) throw new AiServiceError("The AI returned an empty response.");
    try {
        return JSON.parse(content) as T;
    } catch {
        throw new AiServiceError("The AI returned a malformed response.");
    }
};
