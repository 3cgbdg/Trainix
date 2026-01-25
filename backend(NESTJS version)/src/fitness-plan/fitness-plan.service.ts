import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFitnessPlanDto } from './dto/create-fitness-plan.dto';
import { UpdateFitnessPlanDto } from './dto/update-fitness-plan.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ImagesService } from 'src/utils/images/images.service';
import { IReturnMessage, ReturnDataType } from 'src/types/common';
import { FitnessDay } from 'generated/prisma/browser';
import { IReturnAnalysis, IReturnCompleteWorkout, IReturnNumbers, IReturnWorkoutDays } from 'src/types/fitness-plan';
import { Decimal } from '@prisma/client/runtime/index-browser';
import { NotificationsGateway } from 'src/webSockets/notifications.gateway';

@Injectable()
export class FitnessPlanService {

    constructor(private readonly prisma: PrismaService, private readonly imagesService: ImagesService, private readonly notificationsGateway: NotificationsGateway) { }

    // async addFitnessDay(method: string, dto, myId: string) {

    //     const fitnessPlan = await this.prisma.fitnessPlan.findUnique({ where: { userId: myId } });

    //     // parallel adding data - adding image to each of the exercises from unsplash api and saving into a s3 ->saving s3-image-url into a mongodb
    //     if (data.day.exercises !== undefined) {
    //         await Promise.all(
    //             data.day.exercises!.map(async (exercise: IExercise) => {

    //                 const image = await ExerciseImage.findOne({ name: exercise.title });
    //                 if (image) {
    //                     exercise.imageUrl = image.imageUrl;
    //                 } else {
    //                     const url = await this.imagesService.s3ImageUploadingExercise(exercise);
    //                     // if exists continue otherwise adding new doc
    //                     await ExerciseImage.findOneAndUpdate(
    //                         { name: exercise.title },
    //                         { $setOnInsert: { imageUrl: url } },
    //                         { new: true, upsert: true }
    //                     );
    //                     exercise.imageUrl = url;
    //                 }
    //             })

    //         )
    //     }
    //     //adding real date for each day - ai doesn`t generate real dates
    //     if (fitnessPlan) {

    //         if (method == "container") {

    //             const workoutDay = new Date(fitnessPlan.createdAt);
    //             workoutDay.setDate(workoutDay.getDate() + data.day.dayNumber - 1);
    //             data.day.date = workoutDay;
    //             fitnessPlan.report.plan.days.push(data.day);
    //         } else {

    //             data.day.date = new Date(data.day.date);
    //             fitnessPlan.report.plan.days[data.day.dayNumber - 1] = data.day;
    //         }
    //         fitnessPlan.markModified("report.plan.days");
    //         await fitnessPlan.save();

    //         res.status(200).json({ message: "Day created!", day: data });
    //         return;
    //     } else {
    //         const workoutDay = new Date();
    //         data.day.date = workoutDay;
    //         const fitnessPlan = new FitnessPlan({ userId: (req as AuthRequest).userId, "report.plan.week3Title": data.week3Title, "report.plan.week4Title": data.week4Title, "report.plan.week2Title": data.week2Title, "report.plan.week1Title": data.week1Title, "report.plan.days": [data.day], "report.advices": data.advices, "report.streak": 0, "report.briefAnalysis": data.briefAnalysis });
    //         await fitnessPlan.save();
    //         res.status(201).json({ message: "Plan created!" });
    //         return;
    //     }


    // }

    async deleteFitnessPlan(myId: string): Promise<IReturnMessage> {
        await this.prisma.fitnessPlan.delete({ where: { userId: myId } });
        return ({ message: "Successfully deleted!" });
    }

    async getWorkout(day: string, myId: string): Promise<ReturnDataType<FitnessDay>> {

        const workoutDay = await this.prisma.fitnessDay.findFirst({
            where: {
                fitnessPlanContent: { fitnessPlan: { userId: myId } }
                , dayNumber: Number(day)
            }
        });
        if (!workoutDay) {
            throw new NotFoundException("Workout day was not found!")
        }

        return ({ data: workoutDay });

    }

    async getWorkouts(myId: string): Promise<ReturnDataType<IReturnWorkoutDays>> {


        const fitnessPlan = await this.prisma.fitnessPlan.findFirst({ where: { userId: myId }, include: { content: { include: { days: true } } } })
        if (!fitnessPlan || !fitnessPlan.content)
            throw new NotFoundException("Fitness plan was not found!")
        // variable for getting array idx of current day item of

        const today = new Date();
        let todayWorkoutNumber: number | null = null;
        let currentWeekTitle: string | null = null;

        for (let item of fitnessPlan.content.days) {
            const itemDate = new Date(item.date);
            // if date == today - current day idx
            if (itemDate.getDate() === today.getDate() && itemDate.getMonth() === today.getMonth()) {
                todayWorkoutNumber = item.dayNumber - 1;
            }
        }

        // getting current week title from current day idx example:(0-6)1 week
        if (todayWorkoutNumber !== null) {
            currentWeekTitle = todayWorkoutNumber < 7
                ? fitnessPlan.content.week1Title
                : todayWorkoutNumber < 14
                    ? fitnessPlan.content.week2Title
                    : todayWorkoutNumber < 21
                        ? fitnessPlan.content.week3Title
                        : fitnessPlan.content.week4Title;
        }

        const workouts = fitnessPlan.content.days;
        const data = {
            items: workouts,
            todayWorkoutNumber: todayWorkoutNumber,
            currentWeekTitle: currentWeekTitle,
            streak: fitnessPlan.streak,
        }
        return ({ data })

    }

    // analysis for last 6 month period
    async getAnalysis(myId: string): Promise<ReturnDataType<IReturnAnalysis>> {

        const measurements = await this.prisma.measurement.findMany({ where: { userId: myId }, take: 12, orderBy: { createdAt: 'desc' }, include: { metrics: true } });
        if (measurements.length === 0)
            throw new NotFoundException("No measurement was found")

        let chartData: { date: Date, bodyFat: Decimal }[] = [];

        // data for tracking dublicates
        let unavailableMonth: string[] = [];
        for (let item of measurements) {
            // for 6 month
            if (chartData.length > 6) break;
            const month = item.createdAt.toLocaleDateString("en-US", { month: "short" });
            if (!unavailableMonth.includes(month)) {
                unavailableMonth.push(month);
                chartData.push({ date: item.createdAt, bodyFat: item.metrics.bodyFatPercent });

            }
        }


        const advice = await this.prisma.advice.findFirst({ where: { fitnessPlan: { userId: myId } } });
        if (!advice) throw new NotFoundException("No advice was found!");


        const weightDifference = measurements[1] ? Number(measurements[0].metrics.weight) - Number(measurements[1].metrics.weight) : 0;
        const currentBMI = Number(measurements[0].metrics.weight) / (Math.pow(Number(measurements[0].metrics.height) * 0.01, 2));
        const lastBMI = measurements[1] ? Number(measurements[1].metrics.weight) / (Math.pow(Number(measurements[1].metrics.height) * 0.01, 2)) : 0;
        return ({
            data: {
                weight: { data: measurements[0].metrics.weight, difference: !measurements[1] ? 0 : +weightDifference },
                leanBodyMass: { data: measurements[0].metrics.leanBodyMass, difference: !measurements[1] ? 0 : Number(measurements[0].metrics.leanBodyMass) - Number(measurements[1].metrics.leanBodyMass) },
                bodyFatPercent: { data: measurements[0].metrics.bodyFatPercent, difference: !measurements[1] ? 0 : Number(measurements[0].metrics.bodyFatPercent) - Number(measurements[1].metrics.bodyFatPercent) },
                MuscleMass: { data: measurements[0].metrics.muscleMass, difference: !measurements[1] ? 0 : Number(measurements[0].metrics.muscleMass) - Number(measurements[1].metrics.muscleMass) },
                bmi: { data: currentBMI.toFixed(1), difference: !measurements[1] ? 0 : +(currentBMI - lastBMI) },
                imageUrlCurrent: measurements[0].imageUrl,
                imageUrlLast: measurements[1]?.imageUrl ?? null,
                waistToHipRatio: { data: measurements[0].metrics.waistToHipRatio, difference: !measurements[1] ? 0 : Number(measurements[0].metrics.waistToHipRatio) - Number(measurements[1].metrics.waistToHipRatio) },
                advices: advice,
                chartData: chartData
            }
        });


    }

    // getting numbers of statistics for dashboard and progress pages using query filter
    async getNumbers(date: string, progress: string, myId: string): Promise<ReturnDataType<IReturnNumbers>> {

        const measurements = await this.prisma.measurement.findMany({ where: { userId: myId }, take: 12, orderBy: { createdAt: 'desc' }, include: { metrics: true } });

        const fitnessPlan = await this.prisma.fitnessPlan.findFirst({ where: { userId: myId }, include: { content: { include: { days: { include: { exercises: true } } } } } });
        const user = await this.prisma.user.findUnique({ where: { id: myId } });

        if (!fitnessPlan || !fitnessPlan.content || typeof date !== "string")
            throw new NotFoundException("Not found!");

        // getting info for charts (example {month:"Aug",weight:74}[])

        let weightsData: { date: Date, weight: Decimal }[] = [];
        let imagesData: { date: Date, imageUrl: string }[] = [];
        let bodyFatData: { date: Date, bodyFat: Decimal }[] = [];
        let bmiData: { date: Date, bmi: number }[] = [];

        // for getting only one  measurement per month 
        let unavailableMonth: number[] = [];

        for (let item of measurements) {
            // for 6 month
            if (weightsData.length > 6) break;
            const month = item.createdAt.getMonth();
            if (!unavailableMonth.includes(month)) {

                weightsData.push({ date: item.createdAt, weight: item.metrics.weight });
                if (progress) {
                    imagesData.push({ date: new Date(date), imageUrl: item.imageUrl });
                    bodyFatData.push({ date: item.createdAt, bodyFat: item.metrics.bodyFatPercent });
                    bmiData.push({ date: item.createdAt, bmi: +((Number(item.metrics.weight) / (Number(item.metrics.height) * Number(item.metrics.height) / 10000)).toFixed(2)) });
                }
                unavailableMonth.push(month);
            }
            else continue;
        }
        const currentDay = new Date(date);
        const firstDay = new Date(fitnessPlan.createdAt);
        const day = Math.round((currentDay.getTime() - firstDay.getTime()) / (1000 * 3600 * 24));
        const currentCalories = fitnessPlan.content.days[day].exercises!.reduce((acc, cur) => {
            return (cur.status == "COMPLETED" ? acc + cur.calories : acc);
        }, 0)

        return ({
            data: {
                weight: measurements[measurements.length - 1].metrics.weight,
                lastWeight: measurements[measurements.length - 2] ? measurements[measurements.length - 2].metrics.weight : null,
                bmi: +(Number(measurements[measurements.length - 1].metrics.weight) / (Math.pow(Number(measurements[measurements.length - 1].metrics.height) * 0.01, 2))).toFixed(2),
                bodyFat: measurements[measurements.length - 1].metrics.bodyFatPercent,
                streak: fitnessPlan.streak,
                longestStreak: user?.longestStreak,
                calories: { current: currentCalories, target: fitnessPlan.content.days[day].calories },
                weightsData: weightsData,
                fatsData: bodyFatData ?? null,
                bmiData: bmiData ?? null,
                imagesData: imagesData ?? null,
                day: day,
            }
        });

    }


    // completing workout-day func
    async completeWorkout(day: string, myId: string, completedItems: { completed: boolean }[]): Promise<ReturnDataType<IReturnCompleteWorkout>> {
        const fitnessPlan = await this.prisma.fitnessPlan.findFirst({ where: { userId: myId }, include: { content: { include: { days: { where: { dayNumber: Number(day) }, include: { exercises: true } } } } } });
        const user = await this.prisma.user.findUnique({ where: { id: myId } });

        if (!fitnessPlan || !user)
            throw new NotFoundException("Not found!")
        const currentDay = fitnessPlan.content?.days[0];
        if (!currentDay || currentDay.exercises.length == 0)
            throw new BadRequestException("There is no days left!")
        // setting similar status to db 

        for (let [i, exercise] of currentDay.exercises!.entries()) {
            if (completedItems[i]?.completed) {
                exercise.status = "COMPLETED"
            }

        }
        // if every exercise`s status is completed than day status is Completed + streak+=1
        if (currentDay.exercises!.every(exercise => exercise.status === "COMPLETED")) {
            currentDay.status = "COMPLETED";
            fitnessPlan.streak += 1;
            if (fitnessPlan.streak > user.longestStreak) {
                user.longestStreak += 1;
            }

            // updating current metrics (weight + bodyFat with calories release)
            const measurement = await this.prisma.measurement.findFirst({ where: { userId: myId }, orderBy: { createdAt: "desc" }, include: { metrics: true } });


            if (measurement) {
                const newWeight = Number(measurement.metrics.weight) - currentDay.calories! / 7700;
                const fatMass = Math.max(Number(measurement.metrics.weight) - Number(measurement.metrics.leanBodyMass), 0);
                if (!fatMass) {
                    measurement.metrics.leanBodyMass = measurement.metrics.weight;
                    await this.prisma.metrics.update({
                        where: { id: measurement.metricsId }, data: {
                            leanBodyMass: newWeight
                        }
                    });
                } else {
                    const newBodyFatPercent = (fatMass / newWeight) * 100;
                    await this.prisma.metrics.update({
                        where: { id: measurement.metricsId }, data: {
                            bodyFatPercent: newBodyFatPercent
                        }
                    });
                }
                await this.notificationsGateway.notifyUserAfterWorkout(myId);
            }


        }

        return ({ message: "Day is successfully compeleted!", data: { day: currentDay, streak: fitnessPlan.streak } });


    }

}















