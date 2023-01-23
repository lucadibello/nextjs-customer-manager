/*
  Warnings:

  - You are about to drop the column `ExpiresAt` on the `AuthChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `UpdatedAt` on the `AuthChallenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuthChallenge" DROP COLUMN "ExpiresAt",
DROP COLUMN "UpdatedAt";
