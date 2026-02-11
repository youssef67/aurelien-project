-- CreateEnum
CREATE TYPE "request_type" AS ENUM ('INFO', 'ORDER');

-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('PENDING', 'TREATED');

-- CreateTable
CREATE TABLE "requests" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "store_id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "type" "request_type" NOT NULL,
    "message" TEXT,
    "status" "request_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requests_offer_id_idx" ON "requests"("offer_id");

-- CreateIndex
CREATE INDEX "requests_supplier_id_idx" ON "requests"("supplier_id");

-- CreateUniqueIndex: un magasin ne peut envoyer qu'une demande par type par offre
CREATE UNIQUE INDEX "requests_store_id_offer_id_type_key" ON "requests"("store_id", "offer_id", "type");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
