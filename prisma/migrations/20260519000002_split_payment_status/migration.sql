CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');
CREATE TYPE "PaymentMethod_new" AS ENUM ('PIX', 'CASH', 'CARD');

ALTER TABLE "Attendance"
  ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PAID';

UPDATE "Attendance"
SET "paymentStatus" = 'PENDING'
WHERE "paymentMethod"::text = 'PENDING';

ALTER TABLE "Attendance"
  ALTER COLUMN "paymentMethod" DROP NOT NULL;

ALTER TABLE "Attendance"
  ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new"
  USING (
    CASE
      WHEN "paymentMethod"::text = 'PIX' THEN 'PIX'
      WHEN "paymentMethod"::text = 'CASH' THEN 'CASH'
      WHEN "paymentMethod"::text IN ('CARD', 'CREDIT_CARD', 'DEBIT_CARD') THEN 'CARD'
      ELSE NULL
    END
  )::"PaymentMethod_new";

DROP TYPE "PaymentMethod";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
