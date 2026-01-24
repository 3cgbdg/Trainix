-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "FitnessLevelType" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "PrimaryFitnessGoalType" AS ENUM ('LOSE_WEIGHT', 'GAIN_MUSCLE', 'STAY_FIT', 'IMPROVE_ENDURANCE');

-- CreateEnum
CREATE TYPE "DayStatusType" AS ENUM ('PENDING', 'COMPLETED', 'MISSED');

-- CreateEnum
CREATE TYPE "ExerciseStatusType" AS ENUM ('COMPLETED', 'PENDING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "GenderType" NOT NULL,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "targetWeight" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "shoulderToWaistRatio" DECIMAL(4,2) NOT NULL,
    "waistToHipRatio" DECIMAL(4,2) NOT NULL,
    "percentOfLegsLength" DECIMAL(4,2) NOT NULL,
    "shoulderAsymmetricLine" INTEGER NOT NULL,
    "shoulderAngle" INTEGER NOT NULL,
    "fitnessLevel" "FitnessLevelType" NOT NULL,
    "primaryFitnessGoal" "PrimaryFitnessGoalType" NOT NULL,

    CONSTRAINT "Metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FitnessPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefAnalysis" (
    "id" TEXT NOT NULL,
    "targetWeight" INTEGER NOT NULL,
    "fitnessLevel" "FitnessLevelType" NOT NULL,
    "primaryFitnessGoal" "PrimaryFitnessGoalType" NOT NULL,
    "fitnessPlanId" TEXT NOT NULL,

    CONSTRAINT "BriefAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advice" (
    "id" TEXT NOT NULL,
    "nutrition" TEXT NOT NULL,
    "hydration" TEXT NOT NULL,
    "recovery" TEXT NOT NULL,
    "progress" TEXT NOT NULL,
    "fitnessPlanId" TEXT NOT NULL,

    CONSTRAINT "Advice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessPlanContent" (
    "id" TEXT NOT NULL,
    "week1Title" TEXT NOT NULL,
    "week2Title" TEXT NOT NULL,
    "week3Title" TEXT NOT NULL,
    "week4Title" TEXT NOT NULL,
    "fitnessPlanId" TEXT NOT NULL,

    CONSTRAINT "FitnessPlanContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "dayTitle" TEXT NOT NULL,
    "status" "DayStatusType" NOT NULL,
    "calories" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fitnessPlanContentId" TEXT NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "repeats" INTEGER,
    "time" INTEGER,
    "instruction" TEXT NOT NULL,
    "advices" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "status" "ExerciseStatusType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Metrics_userId_key" ON "Metrics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessPlan_userId_key" ON "FitnessPlan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BriefAnalysis_fitnessPlanId_key" ON "BriefAnalysis"("fitnessPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "Advice_fitnessPlanId_key" ON "Advice"("fitnessPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessPlanContent_fitnessPlanId_key" ON "FitnessPlanContent"("fitnessPlanId");

-- AddForeignKey
ALTER TABLE "Metrics" ADD CONSTRAINT "Metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessPlan" ADD CONSTRAINT "FitnessPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefAnalysis" ADD CONSTRAINT "BriefAnalysis_fitnessPlanId_fkey" FOREIGN KEY ("fitnessPlanId") REFERENCES "FitnessPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advice" ADD CONSTRAINT "Advice_fitnessPlanId_fkey" FOREIGN KEY ("fitnessPlanId") REFERENCES "FitnessPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessPlanContent" ADD CONSTRAINT "FitnessPlanContent_fitnessPlanId_fkey" FOREIGN KEY ("fitnessPlanId") REFERENCES "FitnessPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_fitnessPlanContentId_fkey" FOREIGN KEY ("fitnessPlanContentId") REFERENCES "FitnessPlanContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;
