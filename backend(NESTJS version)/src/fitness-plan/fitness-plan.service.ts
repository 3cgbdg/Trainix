import { Injectable } from '@nestjs/common';
import { CreateFitnessPlanDto } from './dto/create-fitness-plan.dto';
import { UpdateFitnessPlanDto } from './dto/update-fitness-plan.dto';

@Injectable()
export class FitnessPlanService {

    async addFitnessDay(method: string, dto, myId: string) {
        // !REDO in nestjs service
        // try {
        //     const fitnessPlan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId });
        //     // parallel adding data - adding image to each of the exercises from unsplash api and saving into a s3 ->saving s3-image-url into a mongodb
        //     if (data.day.exercises !== undefined) {
        //         await Promise.all(
        //             data.day.exercises!.map(async (exercise: IExercise) => {

        //                 const image = await ExerciseImage.findOne({ name: exercise.title });
        //                 if (image) {
        //                     exercise.imageUrl = image.imageUrl;
        //                 } else {
        //                     const url = await s3ImageUploadingExercise(exercise);
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
        // catch (err) {
        //     res.status(500).json({ message: "Server error!" });
        //     return;
        // }
    }
}
