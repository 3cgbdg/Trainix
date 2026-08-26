import OpenAI from "openai";
import { AiServiceError } from "./aiClient";

// Plan/nutrition generation used to live in the Python service purely because that's
// where the OpenAI SDK happened to be installed - those endpoints did no CV work, just
// an f-string prompt and a chat completion. They run here now, next to the data they
// describe. The Python service keeps only /api/photo-analyze, which genuinely needs
// mediapipe.
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.7;

let client: OpenAI | null = null;

const getClient = (): OpenAI => {
    if (!process.env.OPENAI_API_KEY) {
        throw new AiServiceError("AI generation is not configured (OPENAI_API_KEY is unset).");
    }
    client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return client;
};

// exported for tests, which need to drop the memoized client between env changes
export const resetLlmClient = () => { client = null; };

type GenerateOptions = {
    system: string;
    prompt: string;
    temperature?: number;
};

// Asks for JSON and gets JSON. response_format json_object is what makes this
// reliable: the previous setup only *asked* the model for raw JSON in prose, so it
// habitually wrapped the answer in a ```json fence that four different call sites
// then had to regex back out. The model cannot emit a fence in this mode.
export const generateJson = async <T = any>({ system, prompt, temperature }: GenerateOptions): Promise<T> => {
    try {
        const completion = await getClient().chat.completions.create({
            model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
            temperature: temperature ?? DEFAULT_TEMPERATURE,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt },
            ],
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) throw new AiServiceError("The AI returned an empty response.");
        try {
            return JSON.parse(content) as T;
        } catch {
            throw new AiServiceError("The AI returned a malformed response.");
        }
    } catch (err) {
        if (err instanceof AiServiceError) throw err;
        console.error("LLM generation failed", err);
        throw new AiServiceError("The AI service is unavailable. Please try again.");
    }
};
