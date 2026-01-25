/*
  Warnings:

  - You are about to drop the `Day` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MealStatusType" AS ENUM ('EATEN', 'PENDING');

-- CreateEnum
CREATE TYPE "FoodIntakeType" AS ENUM ('SNACK', 'LUNCH', 'BREAKFAST', 'DINNER');

-- DropForeignKey
ALTER TABLE "Day" DROP CONSTRAINT "Day_fitnessPlanContentId_fkey";

-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_dayId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Day";

-- CreateTable
CREATE TABLE "FitnessDay" (
    "id" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "dayTitle" TEXT NOT NULL,
    "status" "DayStatusType" NOT NULL,
    "calories" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fitnessPlanContentId" TEXT NOT NULL,

    CONSTRAINT "FitnessDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionDay" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayNumber" SMALLINT NOT NULL,
    "waterCurrent" SMALLINT NOT NULL,
    "waterTarget" SMALLINT NOT NULL,
    "nutritionPlanId" TEXT NOT NULL,

    CONSTRAINT "NutritionDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyGoals" (
    "id" TEXT NOT NULL,
    "caloriesCurrent" INTEGER NOT NULL,
    "caloriesTarget" INTEGER NOT NULL,
    "proteinCurrent" INTEGER NOT NULL,
    "proteinTarget" INTEGER NOT NULL,
    "carbsCurrent" INTEGER NOT NULL,
    "carbsTarget" INTEGER NOT NULL,
    "fatsCurrent" INTEGER NOT NULL,
    "fatsTarget" INTEGER NOT NULL,
    "dayId" TEXT NOT NULL,

    CONSTRAINT "DailyGoals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterIntake" (
    "id" TEXT NOT NULL,
    "current" SMALLINT NOT NULL,
    "target" SMALLINT NOT NULL,
    "dayId" TEXT NOT NULL,

    CONSTRAINT "WaterIntake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cookingTime" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "preparation" TEXT NOT NULL,
    "mealCalories" SMALLINT NOT NULL,
    "mealProtein" SMALLINT NOT NULL,
    "mealCarbs" SMALLINT NOT NULL,
    "mealFats" SMALLINT NOT NULL,
    "status" "MealStatusType" NOT NULL,
    "foodIntake" "FoodIntakeType" NOT NULL,
    "nutritionDayId" TEXT NOT NULL,
    "mealImageId" TEXT NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_meals_ingredients" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_meals_ingredients_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "NutritionPlan_userId_key" ON "NutritionPlan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyGoals_dayId_key" ON "DailyGoals"("dayId");

-- CreateIndex
CREATE UNIQUE INDEX "WaterIntake_dayId_key" ON "WaterIntake"("dayId");

-- CreateIndex
CREATE INDEX "_meals_ingredients_B_index" ON "_meals_ingredients"("B");

-- AddForeignKey
ALTER TABLE "FitnessDay" ADD CONSTRAINT "FitnessDay_fitnessPlanContentId_fkey" FOREIGN KEY ("fitnessPlanContentId") REFERENCES "FitnessPlanContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "FitnessDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionPlan" ADD CONSTRAINT "NutritionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionDay" ADD CONSTRAINT "NutritionDay_nutritionPlanId_fkey" FOREIGN KEY ("nutritionPlanId") REFERENCES "NutritionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyGoals" ADD CONSTRAINT "DailyGoals_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "NutritionDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterIntake" ADD CONSTRAINT "WaterIntake_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "NutritionDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_nutritionDayId_fkey" FOREIGN KEY ("nutritionDayId") REFERENCES "NutritionDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_mealImageId_fkey" FOREIGN KEY ("mealImageId") REFERENCES "MealImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_meals_ingredients" ADD CONSTRAINT "_meals_ingredients_A_fkey" FOREIGN KEY ("A") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_meals_ingredients" ADD CONSTRAINT "_meals_ingredients_B_fkey" FOREIGN KEY ("B") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
