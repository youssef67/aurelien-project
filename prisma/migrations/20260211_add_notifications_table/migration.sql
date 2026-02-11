-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('NEW_REQUEST', 'REQUEST_TREATED');

-- CreateEnum
CREATE TYPE "user_type" AS ENUM ('SUPPLIER', 'STORE');

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "user_type" "user_type" NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "related_id" UUID,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_user_type_read_idx" ON "notifications"("user_id", "user_type", "read");
