/*
  Warnings:

  - A unique constraint covering the columns `[nutritionPlanId,dayNumber]` on the table `NutritionDay` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NutritionDay_nutritionPlanId_dayNumber_key" ON "NutritionDay"("nutritionPlanId", "dayNumber");
