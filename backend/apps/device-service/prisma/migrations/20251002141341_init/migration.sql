-- CreateEnum
CREATE TYPE "public"."Type" AS ENUM ('LIGHT', 'SENSOR', 'NETWORK', 'SECURITY');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ONLINE', 'OFLINE');

-- CreateEnum
CREATE TYPE "public"."Room" AS ENUM ('LIVINGROOM', 'BEDROOM', 'BATHROOM', 'KITCHEN');

-- CreateTable
CREATE TABLE "public"."Device" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "maxConsumption" INTEGER NOT NULL,
    "room" "public"."Room" NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ONLINE',
    "type" "public"."Type" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_userId_key" ON "public"."Device"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_name_key" ON "public"."Device"("name");
