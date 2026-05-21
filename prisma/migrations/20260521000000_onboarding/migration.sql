ALTER TABLE "Studio"
ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 1;

UPDATE "Studio"
SET "onboardingCompleted" = true
WHERE "createdAt" < NOW();
