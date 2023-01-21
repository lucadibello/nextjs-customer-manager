/*
  Warnings:

  - The primary key for the `AuthChallenge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `AuthChallenge` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AuthChallenge_Token_key";

-- AlterTable
ALTER TABLE "AuthChallenge" DROP CONSTRAINT "AuthChallenge_pkey",
DROP COLUMN "Id",
ADD CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("EmployeeId");
