/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Exercise` table. All the data in the column will be lost.
  - Added the required column `exerciseImageId` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "imageUrl",
ADD COLUMN     "exerciseImageId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_exerciseImageId_fkey" FOREIGN KEY ("exerciseImageId") REFERENCES "ExerciseImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
