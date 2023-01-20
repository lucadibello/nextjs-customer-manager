/*
  Warnings:

  - You are about to drop the column `Password` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `RefreshToken` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `Role` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `TwoFactorToken` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Email]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Password` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Customer_Email_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "Password",
DROP COLUMN "RefreshToken",
DROP COLUMN "Role",
DROP COLUMN "TwoFactorToken";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "Password" TEXT NOT NULL,
ADD COLUMN     "RefreshToken" TEXT,
ADD COLUMN     "Role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
ADD COLUMN     "TwoFactorToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_Email_key" ON "Employee"("Email");
