-- CreateEnum
CREATE TYPE "brand" AS ENUM ('LECLERC', 'INTERMARCHE', 'SUPER_U', 'SYSTEME_U');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" "brand" NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_email_key" ON "suppliers"("email");

-- CreateIndex
CREATE INDEX "suppliers_email_idx" ON "suppliers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "stores_email_key" ON "stores"("email");

-- CreateIndex
CREATE INDEX "stores_email_idx" ON "stores"("email");
