-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactInformationId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInformation" (
    "email" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "User_contactInformationId_unique" ON "User"("contactInformationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactInformation.email_unique" ON "ContactInformation"("email");

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("contactInformationId") REFERENCES "ContactInformation"("email") ON DELETE CASCADE ON UPDATE CASCADE;
