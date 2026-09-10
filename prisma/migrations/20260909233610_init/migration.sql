-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('ISOMETRIA', 'CADEIA_FECHADA', 'CADEIA_POSTERIOR', 'QUADRIL', 'CORE', 'PANTURRILHA');

-- CreateEnum
CREATE TYPE "FoodListType" AS ENUM ('ANTI_INFLAMATORIO', 'SINERGIA_ALONG_C', 'EVITAR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL DEFAULT 'Condropatia patelofemoral grave — joelho esquerdo',
    "mriFindings" TEXT[],
    "currentMedication" TEXT[],
    "contraindications" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sets" TEXT NOT NULL,
    "reps" TEXT NOT NULL,
    "targetMuscles" TEXT NOT NULL,
    "maxFlexionDeg" INTEGER,
    "isIsometric" BOOLEAN NOT NULL DEFAULT false,
    "holdSeconds" INTEGER,
    "execution" TEXT[],
    "careNote" TEXT NOT NULL,
    "anchor" BOOLEAN NOT NULL DEFAULT false,
    "templateGroup" TEXT,
    "phaseMin" INTEGER NOT NULL DEFAULT 1,
    "progression" JSONB NOT NULL,
    "wgerSearchTerm" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseMediaCache" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "found" BOOLEAN NOT NULL,
    "imageUrl" TEXT,
    "sourceName" TEXT,
    "license" TEXT,
    "author" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseMediaCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "painLevel" INTEGER NOT NULL DEFAULT 0,
    "swelling" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExerciseLog" (
    "id" TEXT NOT NULL,
    "workoutLogId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setsCompleted" INTEGER,
    "repsCompleted" TEXT,
    "loadKg" DOUBLE PRECISION,
    "painDuring" INTEGER,

    CONSTRAINT "WorkoutExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "listType" "FoodListType" NOT NULL,
    "nutrient" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAvoidList" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ShoppingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShoppingItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalProfile_userId_key" ON "ClinicalProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");

-- CreateIndex
CREATE INDEX "Exercise_order_idx" ON "Exercise"("order");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseMediaCache_exerciseId_key" ON "ExerciseMediaCache"("exerciseId");

-- CreateIndex
CREATE INDEX "WorkoutLog_userId_date_idx" ON "WorkoutLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutExerciseLog_workoutLogId_exerciseId_key" ON "WorkoutExerciseLog"("workoutLogId", "exerciseId");

-- AddForeignKey
ALTER TABLE "ClinicalProfile" ADD CONSTRAINT "ClinicalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseMediaCache" ADD CONSTRAINT "ExerciseMediaCache_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExerciseLog" ADD CONSTRAINT "WorkoutExerciseLog_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExerciseLog" ADD CONSTRAINT "WorkoutExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ShoppingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
