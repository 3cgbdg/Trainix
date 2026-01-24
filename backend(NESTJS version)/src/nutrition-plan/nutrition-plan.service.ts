import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { PrismaService } from 'prisma/prisma.service';
import {  ReturnNutritionDayType, ReturnNutritionStatisticsType } from 'src/types/nutrition-plan';
import { IReturnMessage } from 'src/types/common';
@Injectable()
export class NutritionPlanService {
  constructor(private readonly prisma: PrismaService) { };

  async createNutritionPlan(dto: CreateNutritionPlanDto, myId: string) {
    const dayDate = new Date();
    const date = dayDate.setDate(dayDate.getDate() + dto.day.dayNumber - 1);
    console.log(dayDate);

    // if plan exists then we pushing new day otherwise creating new plan including the day in it 
    let nutritionPlan = await this.prisma.nutritionPlan.findUnique({ where: { userId: myId } });

    // parallel for optimized using in adding images to each meal
    await Promise.all(
      dto.day.meals.map(async (meal) => {
        const image = await this.prisma.mealImage.findUnique({ where: { name: meal.mealTitle } });
        if (!image) {


          const url = await s3ImageUploadingMeal(meal);

          await this.prisma.mealImage.create(
            {
              data: {
                name: meal.mealTitle,
                url
              }
            },
          );
          meal.imageUrl = url;
        }

      }))

    // if plan exists just pushing
    if (nutritionPlan) {
      nutritionPlan.days.push(obj);
      await nutritionPlan.save();
      res.status(200).json({ message: "Successfully added day!" });
      return;
    }
    // otherwise creating plan with this item
    else {
      nutritionPlan = await NutritionPlan.create({ userId: (req as AuthRequest).userId, "days": [obj], createdAt: new Date() });
      res.status(201).json({ message: "Nutrition plan created!", day: obj });
      return;
    }
  }

  async getNutritionDay(myId: string): Promise<ReturnNutritionDayType> {

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const nutritionPlan = await this.prisma.nutritionPlan.findFirst({ where: { userId: myId } });
    if (!nutritionPlan) {
      throw new NotFoundException("Nutrition Plan was not found")
    }

    const dayNumber = Math.round(
      ((new Date().getTime() - new Date(nutritionPlan.createdAt).getTime()) /
        MS_PER_DAY) + 1
    );

    const nutritionDay = await this.prisma.nutritionDay.findUnique({ where: {nutritionPlanId_dayNumber:{ nutritionPlanId: nutritionPlan.id, dayNumber }}, include: { meals: { include: { ingredients: true, mealImage: true } }, dailyGoals: true, waterIntake: true } })

    if (!nutritionDay) {
      throw new NotFoundException("Nutrition Day was not found")
    }


    return nutritionDay;
  }

  async updateWaterCurrent(myId: string, day: string, amount: number): Promise<IReturnMessage> {

    if (amount <= 0) {
      throw new BadRequestException("Amount must be positive");
    }

    // getting parsed to num idx of the day
    const dayNum = Number(day);
    const nutritionPlan = await this.prisma.nutritionPlan.findFirst({ where: { userId: myId } });
    if (!nutritionPlan) {
      throw new NotFoundException("Nutrition Plan was not found")
    }

    // adding numbers to current waterIntake
    await this.prisma.nutritionDay.update({ where: { nutritionPlanId_dayNumber:{dayNumber: dayNum, nutritionPlanId: nutritionPlan.id} }, data: { waterCurrent: { increment: amount } } })



    return ({ message: "Status updated!" })
  }

  async getWeekStatistics(myId: string, week: string): Promise<ReturnNutritionStatisticsType> {

    const weekNumber = Number(week);

    // finding week number forlater loop idx using
    const nutritionPlan = await this.prisma.nutritionPlan.findFirst({ where: { userId: myId } });
    if (!nutritionPlan) {
      throw new NotFoundException("Nutrition Plan was not found")
    }

    const days = await this.prisma.nutritionDay.findMany({ where: {nutritionPlanId: nutritionPlan.id }, include: { dailyGoals: true }, orderBy: { dayNumber: "asc" }, take: 7, skip: 7 * (weekNumber - 1) });

    if (days.length == 0) {
      throw new NotFoundException("Days were not found");
    }
    // loop for 7 days

    let data = days.map(day => (
      {
        day: day.date.toLocaleDateString("en-US", { weekday: "short" }),
        calories: day.dailyGoals?.caloriesCurrent,
        protein: day.dailyGoals?.proteinCurrent,
        carbs: day.dailyGoals?.carbsCurrent,
        fats: day.dailyGoals?.fatsCurrent

      }
    ))


    return ({ data })
  }


  async updateMealStatus(myId: string, day: string, mealId: string): Promise<IReturnMessage> {

    const dayNum = Number(day);

    const mealInfo = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!mealInfo) {
      throw new NotFoundException("Meal was not found")

    }

    const nutritionPlan = await this.prisma.nutritionPlan.findFirst({ where: { userId: myId } });
    if (!nutritionPlan) {
      throw new NotFoundException("Nutrition Plan was not found")
    }
    //adding fresh numbers to dailyGoals - calories,fats,carbs,protein.
    await this.prisma.nutritionDay.update({
      where: { nutritionPlanId_dayNumber: { nutritionPlanId: nutritionPlan.id, dayNumber: dayNum } },
      data: {

        dailyGoals: {
          update: {
            fatsCurrent: { increment: mealInfo.mealFats },
            carbsCurrent: { increment: mealInfo.mealCarbs },
            caloriesCurrent: { increment: mealInfo.mealCalories },
            proteinCurrent: { increment: mealInfo.mealProtein },
          }
        }
        ,
        meals: { update: { where: {id:mealId}, data: { status: "EATEN" } } }
      }
    })

    return ({ message: "Status updated!" });

  }
}












