-- CreateTable
CREATE TABLE "AuthChallenge" (
    "Id" SERIAL NOT NULL,
    "Token" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,
    "EmployeeId" INTEGER NOT NULL,

    CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthChallenge_Token_key" ON "AuthChallenge"("Token");

-- AddForeignKey
ALTER TABLE "AuthChallenge" ADD CONSTRAINT "AuthChallenge_EmployeeId_fkey" FOREIGN KEY ("EmployeeId") REFERENCES "Employee"("EmployeeId") ON DELETE RESTRICT ON UPDATE CASCADE;
