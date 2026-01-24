/*
  Warnings:

  - You are about to drop the column `fitnessLevel` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `primaryFitnessGoal` on the `Metrics` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationTopicType" AS ENUM ('WATER', 'SPORT', 'NUTRITION', 'MEASUREMENT');

-- AlterTable
ALTER TABLE "Metrics" DROP COLUMN "fitnessLevel",
DROP COLUMN "primaryFitnessGoal";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fitnessLevel" "FitnessLevelType",
ADD COLUMN     "primaryFitnessGoal" "PrimaryFitnessGoalType",
ALTER COLUMN "targetWeight" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "topic" "NotificationTopicType" NOT NULL,
    "info" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
