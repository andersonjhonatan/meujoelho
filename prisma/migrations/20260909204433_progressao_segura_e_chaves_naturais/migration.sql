-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "wgerExerciseId" INTEGER;

-- AlterTable
ALTER TABLE "ExerciseMediaCache" ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "WorkoutLog" ADD COLUMN     "dayKey" TEXT NOT NULL,
ADD COLUMN     "phase" INTEGER,
ADD COLUMN     "template" TEXT;

-- CreateIndex
CREATE INDEX "ExerciseMediaCache_fetchedAt_idx" ON "ExerciseMediaCache"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FoodItem_listType_nutrient_key" ON "FoodItem"("listType", "nutrient");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingCategory_name_key" ON "ShoppingCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingItem_categoryId_name_key" ON "ShoppingItem"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutLog_userId_dayKey_key" ON "WorkoutLog"("userId", "dayKey");

