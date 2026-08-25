
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

// each job is wrapped once here so both the in-process node-cron schedule and the
// external manual trigger below (runDueCronJobs) share the exact same runExclusive
// guard - otherwise the two trigger paths could run the same job concurrently
const jobs: Record<string, () => Promise<void>> = {
    regularReminder: runExclusive("regularReminder", regularReminder),
    workoutReminder: runExclusive("workoutReminder", workoutReminder),
    metricsReminder: runExclusive("metricsReminder", metricsReminder),
    createNewMeasurement: runExclusive("createNewMeasurement", createNewMeasurement),
    checkMissedDay: runExclusive("checkMissedDay", checkMissedDay),
    generateNewDayFitnessContent: runExclusive("generateNewDayFitnessContent", generateNewDayFitnessContent),
    generateNewDayNutritionContent: runExclusive("generateNewDayNutritionContent", generateNewDayNutritionContent),
    checkingStatusOfPlan: runExclusive("checkingStatusOfPlan", checkingStatusOfPlan),
};

export const initCron = () => {
    // cron for socket notifications (waterIntake + nutrition plan ) --every 2 hours
    nodeCron.schedule("0 */3 * * *", jobs.regularReminder)
    // cron every 14:00 for checking completing fitness day exercises
    nodeCron.schedule("00 14 * * *", jobs.workoutReminder)
    // cron for every 2 weeks (14 days) metrics reminder
    nodeCron.schedule("0 8 */14 * *", jobs.metricsReminder)
    // checking every day for 14 days difference between measurement docs for creating a new one
    nodeCron.schedule("0 8 * * *", jobs.createNewMeasurement)
    //cron for every day checking missed workout days
    nodeCron.schedule("0 0 * * *", jobs.checkMissedDay)
    // generating each day full info for workout of the day
    nodeCron.schedule("0 0 * * *", jobs.generateNewDayFitnessContent)
    // generating each day full info for nutrition of the day
    nodeCron.schedule("0 0 * * *", jobs.generateNewDayNutritionContent)

    // generating each day full info for nutrition of the day
    nodeCron.schedule("*/15 * * * * *", jobs.checkingStatusOfPlan);
}

// Render's free tier suspends the dyno after ~15 minutes of no HTTP traffic, and
// node-cron only fires while the process is alive - so a tick scheduled for, say,
// midnight is silently skipped whenever the dyno happens to be asleep at that moment.
// That's the root cause behind "next day's plan content doesn't show up": every job
// above is written to be safe to re-run at any time (each checks real elapsed time or
// already-covered state rather than assuming it's invoked exactly once a day), so this
// lets an external scheduler (a Render Cron Job, or a free pinger like cron-job.org)
// wake the dyno and force all of them to catch up by hitting
// POST /api/internal/cron with header "x-cron-secret: <CRON_SECRET>" every 15-30 minutes.
export const runDueCronJobs = async (): Promise<void> => {
    await Promise.all(Object.values(jobs).map((job) => job()));
}

