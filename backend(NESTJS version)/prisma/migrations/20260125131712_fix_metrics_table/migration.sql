/*
  Warnings:

  - You are about to alter the column `height` on the `Metrics` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - You are about to alter the column `weight` on the `Metrics` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - You are about to alter the column `shoulderAsymmetricLine` on the `Metrics` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - You are about to alter the column `shoulderAngle` on the `Metrics` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - A unique constraint covering the columns `[name]` on the table `Ingredient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bodyFatPercent` to the `Metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leanBodyMass` to the `Metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `muscleMass` to the `Metrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Metrics" ADD COLUMN     "bodyFatPercent" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "leanBodyMass" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "muscleMass" DECIMAL(5,2) NOT NULL,
ALTER COLUMN "height" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "percentOfLegsLength" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "shoulderAsymmetricLine" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "shoulderAngle" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "NutritionPlan" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");
