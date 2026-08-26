import FitnessPlan, { IDayPlan, IExercise } from "../models/FitnessPlan";
import ExerciseImage from "../models/ExerciseImage";
import User from "../models/User";
import Measurement from "../models/Measurement";
import { s3ImageUploadingExercise } from "./images";
import { requestAiReport } from "./aiClient";
import { io, userSocketMap } from "../socket";

const TOTAL_DAYS = 28;

const emitToUser = (userId: string, event: string, payload: unknown) => {
    const socketId = userSocketMap.get(userId);
    if (socketId) io.to(socketId).emit(event, payload);
};

const attachExerciseImages = async (exercises: IExercise[]) => {
    await Promise.all(
        exercises.map(async (exercise) => {
            const image = await ExerciseImage.findOne({ name: exercise.title });
            if (image) {
                exercise.imageUrl = image.imageUrl;
            } else {
                const url = await s3ImageUploadingExercise(exercise);
                await ExerciseImage.findOneAndUpdate(
                    { name: exercise.title },
                    { $setOnInsert: { imageUrl: url } },
                    { new: true, upsert: true }
                );
                exercise.imageUrl = url;
            }
        })
    );
};

// Runs the full 28-day plan generation server-side instead of the client making
// 28 sequential/batched round trips. The request that kicks this off returns
// immediately (see generateFitnessPlan in fitnessPlanController) - progress and
// completion are pushed to the client over the socket connection instead, keyed
// by userId the same way notifications already are.
export const runFitnessPlanGeneration = async (userId: string): Promise<void> => {
    try {
        const [user, measurement] = await Promise.all([
            User.findById(userId),
            Measurement.findOne({ userId }).sort({ createdAt: -1 }),
        ]);
        if (!user) {
            emitToUser(userId, "fitnessPlanError", { message: "User was not found." });
            return;
        }

        const userInfo = {
            height: user.metrics.height,
            weight: user.metrics.weight,
            targetWeight: user.targetWeight,
            primaryFitnessGoal: user.primaryFitnessGoal,
            fitnessLevel: user.fitnessLevel,
            gender: user.gender,
            waistToHipRatio: measurement?.metrics.waistToHipRatio,
            shoulderToWaistRatio: measurement?.metrics.shoulderToWaistRatio,
            bodyFatPercent: measurement?.metrics.bodyFatPercent,
            muscleMass: measurement?.metrics.muscleMass,
            leanBodyMass: measurement?.metrics.leanBodyMass,
        };

        let plan = await FitnessPlan.findOne({ userId });

        for (let dayNumber = 1; dayNumber <= TOTAL_DAYS; dayNumber++) {
            const info = await requestAiReport("/api/fitnessPlan", userInfo, { query: { dayNumber } });
            const day: IDayPlan = info.day;

            if (day.exercises?.length) await attachExerciseImages(day.exercises);

            if (!plan) {
                day.date = new Date();
                plan = new FitnessPlan({
                    userId,
                    "report.plan.week1Title": info.week1Title,
                    "report.plan.week2Title": info.week2Title,
                    "report.plan.week3Title": info.week3Title,
                    "report.plan.week4Title": info.week4Title,
                    "report.plan.days": [day],
                    "report.advices": info.advices,
                    "report.streak": 0,
                    "report.briefAnalysis": info.briefAnalysis,
                });
            } else {
                const workoutDay = new Date(plan.createdAt);
                workoutDay.setDate(workoutDay.getDate() + dayNumber - 1);
                day.date = workoutDay;
                // upsert by dayNumber - keeps a retry/resume of a partially generated
                // plan from duplicating a day instead of replacing it
                const existingIndex = plan.report.plan.days.findIndex((d) => d.dayNumber === dayNumber);
                if (existingIndex !== -1) plan.report.plan.days[existingIndex] = day;
                else plan.report.plan.days.push(day);
                plan.markModified("report.plan.days");
            }
            await plan.save();
            emitToUser(userId, "fitnessPlanProgress", { day: dayNumber, total: TOTAL_DAYS });
        }

        emitToUser(userId, "fitnessPlanReady", { total: TOTAL_DAYS });
    } catch (err) {
        console.error(err);
        emitToUser(userId, "fitnessPlanError", { message: "Plan generation failed. Please try again." });
    }
};
