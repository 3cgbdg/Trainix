
import nodeCron from "node-cron";

import { checkMissedDay, createNewMeasurement, metricsReminder, regularReminder, workoutReminder } from "./cronsLogicFuncs";


export const cronNotifs = () => {
    // cron for socket notifications (waterIntake + nutrition plan ) --every 2 hours
    nodeCron.schedule("0 */3 * * *", regularReminder
    )
    // cron every 14:00 for checking completing fitness day exercises
    nodeCron.schedule("00 14 * * *", workoutReminder)
    // cron for every 2 weeks (14 days) metrics reminder
    nodeCron.schedule("0 8 */14 * *", metricsReminder)
    // checking every day for 14 days difference between measurement docs for creating a new one
    nodeCron.schedule("0 8 * * *", createNewMeasurement)
    //cron for every day checking missed workout days
    nodeCron.schedule("0 0 * * * *", checkMissedDay)

}


