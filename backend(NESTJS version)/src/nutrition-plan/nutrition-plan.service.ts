import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ReturnNutritionDayType, ReturnNutritionStatisticsType } from 'src/types/nutrition-plan';
import { IReturnMessage } from 'src/types/common';
import { ImagesService } from 'src/utils/images/images.service';
@Injectable()
export class NutritionPlanService {
  constructor(private readonly prisma: PrismaService, private readonly imagesService: ImagesService) { };

  async create(dto: CreateNutritionPlanDto, myId: string): Promise<IReturnMessage> {
    const dayDate = dto.day.date ? new Date(dto.day.date) : new Date();

    await Promise.all(
      dto.day.meals.map(async (meal) => {
        const image = await this.prisma.mealImage.findUnique({ where: { name: meal.mealTitle } });
        if (!image) {
          const url = await this.imagesService.s3ImageUploadingMeal(meal);
          await this.prisma.mealImage.create({
            data: {
              name: meal.mealTitle,
              url
            }
          });
          meal.imageUrl = url;
        } else {
          meal.imageUrl = image.url;
        }
      })
    );

    const nutritionPlan = await this.prisma.nutritionPlan.upsert({
      where: { userId: myId },
      update: {},
      create: {
        userId: myId,
        createdAt: new Date(),
      },
    });

    const { meals, dailyGoals, ...dayData } = dto.day;

    const mealsData = await Promise.all(meals.map(async (meal) => {
      const mealImageRecord = await this.prisma.mealImage.findUnique({ where: { name: meal.mealTitle } });
      if (!mealImageRecord) {
        throw new BadRequestException(`Image for meal ${meal.mealTitle} not found and failed to upload`);
      }
      const { mealTitle, ingredients, imageUrl, ...m } = meal;
      return {
        ...m,
        title: mealTitle,
        mealImage: {
          connect: { id: mealImageRecord.id }
        },
        ingredients: {
          connectOrCreate: (ingredients?.map(name => ({
            where: { name },
            create: { name }
          })) || []) as any
        }
      };
    }));

    const dailyGoalsData = dailyGoals ? {
      caloriesTarget: dailyGoals.caloriesTarget,
      proteinTarget: dailyGoals.proteinTarget,
      carbsTarget: dailyGoals.carbsTarget,
      fatsTarget: dailyGoals.fatsTarget,
      caloriesCurrent: dailyGoals.caloriesCurrent ?? 0,
      proteinCurrent: dailyGoals.proteinCurrent ?? 0,
      carbsCurrent: dailyGoals.carbsCurrent ?? 0,
      fatsCurrent: dailyGoals.fatsCurrent ?? 0,
    } : undefined;

    await this.prisma.nutritionDay.upsert({
      where: {
        nutritionPlanId_dayNumber: {
          nutritionPlanId: nutritionPlan.id,
          dayNumber: dayData.dayNumber
        }
      },
      update: {
        ...dayData,
        date: dayDate,
        waterCurrent: dayData.waterCurrent ?? 0,
        waterTarget: dayData.waterTarget ?? 0,
        dailyGoals: dailyGoalsData ? {
          upsert: {
            create: dailyGoalsData,
            update: dailyGoalsData
          }
        } : undefined,
        meals: {
          deleteMany: {},
          create: mealsData
        }
      },
      create: {
        ...dayData,
        date: dayDate,
        waterCurrent: dayData.waterCurrent ?? 0,
        waterTarget: dayData.waterTarget ?? 0,
        nutritionPlanId: nutritionPlan.id,
        dailyGoals: dailyGoalsData ? {
          create: dailyGoalsData
        } : undefined,
        meals: {
          create: mealsData
        },
        waterIntake: {
          create: {
            current: dayData.waterCurrent ?? 0,
            target: dayData.waterTarget ?? 0
          }
        }
      }
    });

    return { message: "Successfully added/updated day!" };
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

    const nutritionDay = await this.prisma.nutritionDay.findUnique({ where: { nutritionPlanId_dayNumber: { nutritionPlanId: nutritionPlan.id, dayNumber } }, include: { meals: { include: { ingredients: true, mealImage: true } }, dailyGoals: true, waterIntake: true } })

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
    await this.prisma.nutritionDay.update({ where: { nutritionPlanId_dayNumber: { dayNumber: dayNum, nutritionPlanId: nutritionPlan.id } }, data: { waterCurrent: { increment: amount } } })



    return ({ message: "Status updated!" })
  }

  async getWeekStatistics(myId: string, week: string): Promise<ReturnNutritionStatisticsType> {

    const weekNumber = Number(week);

    // finding week number forlater loop idx using
    const nutritionPlan = await this.prisma.nutritionPlan.findFirst({ where: { userId: myId } });
    if (!nutritionPlan) {
      throw new NotFoundException("Nutrition Plan was not found")
    }

    const days = await this.prisma.nutritionDay.findMany({ where: { nutritionPlanId: nutritionPlan.id }, include: { dailyGoals: true }, orderBy: { dayNumber: "asc" }, take: 7, skip: 7 * (weekNumber - 1) });

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
        meals: { update: { where: { id: mealId }, data: { status: "EATEN" } } }
      }
    })

    return ({ message: "Status updated!" });

  }
}












