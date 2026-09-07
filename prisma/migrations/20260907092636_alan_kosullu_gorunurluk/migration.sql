-- AlterTable
ALTER TABLE "product_type_fields" ADD COLUMN     "showWhenKey" TEXT,
ADD COLUMN     "showWhenValues" TEXT[] DEFAULT ARRAY[]::TEXT[];
