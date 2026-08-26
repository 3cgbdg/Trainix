import { AiServiceError } from "../utils/aiClient";
import { buildFitnessDayPrompt, buildFitnessPlanPrompt, buildNutritionPrompt } from "../utils/prompts";

import axios from "axios";
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
// the client posts to the REST API directly rather than via the openai SDK, so the
// assertions below target the request body it builds

import { generateJson } from "../utils/llmClient";

const USER_INFO = {
    height: 180, weight: 80, targetWeight: 75, primaryFitnessGoal: "Lose weight",
    fitnessLevel: "Beginner", gender: "Male", waistToHipRatio: 0.9,
    shoulderToWaistRatio: 1.4, bodyFatPercent: 20, muscleMass: 35, leanBodyMass: 64,
};

const reply = (content: string | null) => ({ data: { choices: [{ message: { content } }] } });

describe("in-process LLM generation", () => {
    const originalKey = process.env.OPENAI_API_KEY;

    beforeEach(() => {
        jest.clearAllMocks();
        (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn(() => false);
        process.env.OPENAI_API_KEY = "sk-test-key";
    });

    afterAll(() => {
        process.env.OPENAI_API_KEY = originalKey;
    });

    describe("generateJson", () => {
        // json_object mode is what makes the markdown-fence problem structurally
        // impossible, rather than something a regex has to clean up afterwards
        it("requests JSON mode so the model cannot wrap output in a fence", async () => {
            (mockedAxios.post as jest.Mock).mockResolvedValue(reply('{"ok":true}'));
            await generateJson({ system: "s", prompt: "p" });

            const [, params] = (mockedAxios.post as jest.Mock).mock.calls[0];
            expect(params.response_format).toEqual({ type: "json_object" });
            expect(params.messages).toEqual([
                { role: "system", content: "s" },
                { role: "user", content: "p" },
            ]);
        });

        it("parses the returned JSON", async () => {
            (mockedAxios.post as jest.Mock).mockResolvedValue(reply('{"a":1,"b":[2]}'));
            await expect(generateJson({ system: "s", prompt: "p" })).resolves.toEqual({ a: 1, b: [2] });
        });

        it("throws a typed error on malformed JSON", async () => {
            (mockedAxios.post as jest.Mock).mockResolvedValue(reply("not json at all"));
            await expect(generateJson({ system: "s", prompt: "p" })).rejects.toThrow(AiServiceError);
        });

        it("throws a typed error on an empty completion", async () => {
            (mockedAxios.post as jest.Mock).mockResolvedValue(reply(null));
            await expect(generateJson({ system: "s", prompt: "p" })).rejects.toThrow(AiServiceError);
        });

        it("surfaces provider failures as a typed error, not a raw SDK error", async () => {
            (mockedAxios.post as jest.Mock).mockRejectedValue(new Error("429 rate limited"));
            await expect(generateJson({ system: "s", prompt: "p" })).rejects.toThrow(AiServiceError);
        });

        it("fails clearly when no API key is configured", async () => {
            delete process.env.OPENAI_API_KEY;
            await expect(generateJson({ system: "s", prompt: "p" })).rejects.toThrow(/OPENAI_API_KEY/);
        });

        it("honours an OPENAI_MODEL override", async () => {
            process.env.OPENAI_MODEL = "gpt-4o";
            (mockedAxios.post as jest.Mock).mockResolvedValue(reply("{}"));
            await generateJson({ system: "s", prompt: "p" });
            expect((mockedAxios.post as jest.Mock).mock.calls[0][1].model).toBe("gpt-4o");
            delete process.env.OPENAI_MODEL;
        });
    });

    // These prompts were ported from the Python service. The assertions pin the parts
    // the persistence layer actually depends on.
    describe("prompts", () => {
        it("asks for the full plan scaffold on day 1 only", () => {
            const first = buildFitnessPlanPrompt(USER_INFO, 1);
            expect(first).toContain("briefAnalysis");
            expect(first).toContain("week1Title");
            expect(first).toContain("Day number: 1");
        });

        it("carries the user's metrics into the prompt", () => {
            const prompt = buildFitnessPlanPrompt(USER_INFO, 1);
            expect(prompt).toContain("Height: 180 cm");
            expect(prompt).toContain("Primary Fitness Goal: Lose weight");
            expect(prompt).toContain("BodyFat Percent: 20");
        });

        it("pins the day type and number when filling in exercises", () => {
            const prompt = buildFitnessDayPrompt(USER_INFO, { dayNumber: 7, day: "Lower Body Focus" });
            expect(prompt).toContain("Day number: 7");
            expect(prompt).toContain("Lower Body Focus");
            expect(prompt).toMatch(/do not invent new values/i);
        });

        // the original Python prompt put waterIntake outside the JSON object it asked
        // for, while the persistence layer reads day.waterIntake.current
        // unconditionally - a literal-minded response would have broken water tracking
        it("keeps waterIntake inside the nutrition day object", () => {
            const prompt = buildNutritionPrompt(USER_INFO, 3);
            const body = prompt.slice(prompt.indexOf("{"), prompt.lastIndexOf("}") + 1);
            expect(body).toContain('"waterIntake"');
            expect(body).toContain('"dailyGoals"');
            expect(body).toContain('"meals"');
            expect(prompt).toContain("Day number: 3");
        });

        // OpenAI's json_object mode requires the word "json" somewhere in the messages
        it.each([
            ["fitness plan", buildFitnessPlanPrompt(USER_INFO, 1)],
            ["fitness day", buildFitnessDayPrompt(USER_INFO, { dayNumber: 2, day: "Full Body & Core" })],
            ["nutrition", buildNutritionPrompt(USER_INFO, 1)],
        ])("%s prompt mentions JSON, as json_object mode requires", (_name, prompt) => {
            expect(prompt.toLowerCase()).toContain("json");
        });
    });
});
