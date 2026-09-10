-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "clearanceNote" TEXT,
ADD COLUMN     "needsClearance" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "imageUrl" DROP NOT NULL;

