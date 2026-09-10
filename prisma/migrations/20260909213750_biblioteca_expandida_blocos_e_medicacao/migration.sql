-- CreateEnum
CREATE TYPE "SessionBlock" AS ENUM ('MOBILIDADE', 'ATIVACAO', 'PRINCIPAL', 'CORE', 'FINALIZACAO');

-- CreateEnum
CREATE TYPE "PfjLoad" AS ENUM ('BAIXA', 'MODERADA', 'ALTA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExerciseCategory" ADD VALUE 'MOBILIDADE';
ALTER TYPE "ExerciseCategory" ADD VALUE 'CONTROLE_MOTOR';

-- AlterTable
ALTER TABLE "ClinicalProfile" DROP COLUMN "currentMedication",
ADD COLUMN     "openQuestions" TEXT[];

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "block" "SessionBlock" NOT NULL DEFAULT 'PRINCIPAL',
ADD COLUMN     "equipment" TEXT[],
ADD COLUMN     "pfjLoad" "PfjLoad" NOT NULL DEFAULT 'BAIXA',
ADD COLUMN     "rationale" TEXT NOT NULL DEFAULT '';

-- A coluna nasce com default para não quebrar em bancos que já têm exercícios
-- (o seed preenche o texto real logo em seguida); o default sai depois para
-- que um exercício novo sem justificativa clínica não passe despercebido.
ALTER TABLE "Exercise" ALTER COLUMN "rationale" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "activeName" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "cautionNote" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Medication_userId_name_key" ON "Medication"("userId", "name");

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

