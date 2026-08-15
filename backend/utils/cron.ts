
import nodeCron from "node-cron";

import { checkMissedDay, createNewMeasurement, generateNewDayFitnessContent, metricsReminder, regularReminder, workoutReminder, generateNewDayNutritionContent, checkingStatusOfPlan } from "./cronsLogicFuncs";

const runningJobs = new Set<string>();

// skips a scheduled tick if the previous run of the same job hasn't finished yet,
// so a slow run can't stack overlapping invocations on top of each other
const runExclusive = (name: string, fn: () => Promise<void>) => async () => {
    if (runningJobs.has(name)) return;
    runningJobs.add(name);
    try {
        await fn();
    } finally {
        runningJobs.delete(name);
    }
};

export const initCron = () => {
    // cron for socket notifications (waterIntake + nutrition plan ) --every 2 hours
    nodeCron.schedule("0 */3 * * *", runExclusive("regularReminder", regularReminder)
    )
    // cron every 14:00 for checking completing fitness day exercises
    nodeCron.schedule("00 14 * * *", runExclusive("workoutReminder", workoutReminder))
    // cron for every 2 weeks (14 days) metrics reminder
    nodeCron.schedule("0 8 */14 * *", runExclusive("metricsReminder", metricsReminder))
    // checking every day for 14 days difference between measurement docs for creating a new one
    nodeCron.schedule("0 8 * * *", runExclusive("createNewMeasurement", createNewMeasurement))
    //cron for every day checking missed workout days
    nodeCron.schedule("0 0 * * *", runExclusive("checkMissedDay", checkMissedDay))
    // generating each day full info for workout of the day
    nodeCron.schedule("0 0 * * *", runExclusive("generateNewDayFitnessContent", generateNewDayFitnessContent))
    // generating each day full info for nutrition of the day
    nodeCron.schedule("0 0 * * *", runExclusive("generateNewDayNutritionContent", generateNewDayNutritionContent))

    // generating each day full info for nutrition of the day
    nodeCron.schedule("*/15 * * * * *", runExclusive("checkingStatusOfPlan", checkingStatusOfPlan));
}

