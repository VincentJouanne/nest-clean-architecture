-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactInformationsId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInformations" (
    "email" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "User_contactInformationsId_unique" ON "User"("contactInformationsId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactInformations.email_unique" ON "ContactInformations"("email");

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("contactInformationsId") REFERENCES "ContactInformations"("email") ON DELETE CASCADE ON UPDATE CASCADE;
