-- CreateEnum
CREATE TYPE "offer_category" AS ENUM ('EPICERIE', 'FRAIS', 'DPH', 'SURGELES', 'BOISSONS', 'AUTRES');

-- CreateEnum
CREATE TYPE "offer_status" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED');

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "supplier_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "promo_price" DECIMAL(10,2) NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "category" "offer_category" NOT NULL,
    "subcategory" TEXT,
    "photo_url" TEXT,
    "margin" DECIMAL(5,2),
    "volume" TEXT,
    "conditions" TEXT,
    "animation" TEXT,
    "status" "offer_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offers_supplier_id_idx" ON "offers"("supplier_id");

-- CreateIndex
CREATE INDEX "offers_status_start_date_end_date_idx" ON "offers"("status", "start_date", "end_date");

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
