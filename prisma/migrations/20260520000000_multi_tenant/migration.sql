CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'RECEPTIONIST');

CREATE TABLE "Studio" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logoUrl" TEXT,
  "primaryColor" TEXT,
  "secondaryColor" TEXT,
  "theme" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Studio_slug_key" ON "Studio"("slug");

INSERT INTO "Studio" ("id", "name", "slug", "primaryColor", "secondaryColor", "theme", "updatedAt")
VALUES ('default_studio', 'Beauty Schedule Studio', 'beauty-schedule', '#9f5366', '#f8dfe7', 'rose', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'ADMIN';
ALTER TABLE "User" ADD COLUMN "studioId" TEXT;
UPDATE "User" SET "studioId" = 'default_studio' WHERE "studioId" IS NULL;
ALTER TABLE "User" ALTER COLUMN "studioId" SET NOT NULL;

ALTER TABLE "Client" ADD COLUMN "studioId" TEXT;
UPDATE "Client" SET "studioId" = 'default_studio' WHERE "studioId" IS NULL;
ALTER TABLE "Client" ALTER COLUMN "studioId" SET NOT NULL;

ALTER TABLE "Service" ADD COLUMN "studioId" TEXT;
UPDATE "Service" SET "studioId" = 'default_studio' WHERE "studioId" IS NULL;
ALTER TABLE "Service" ALTER COLUMN "studioId" SET NOT NULL;

ALTER TABLE "Appointment" ADD COLUMN "studioId" TEXT;
UPDATE "Appointment" SET "studioId" = 'default_studio' WHERE "studioId" IS NULL;
ALTER TABLE "Appointment" ALTER COLUMN "studioId" SET NOT NULL;

ALTER TABLE "Attendance" ADD COLUMN "studioId" TEXT;
UPDATE "Attendance" SET "studioId" = 'default_studio' WHERE "studioId" IS NULL;
ALTER TABLE "Attendance" ALTER COLUMN "studioId" SET NOT NULL;

CREATE INDEX "User_studioId_idx" ON "User"("studioId");
CREATE INDEX "Client_studioId_idx" ON "Client"("studioId");
CREATE INDEX "Service_studioId_idx" ON "Service"("studioId");
CREATE INDEX "Appointment_studioId_idx" ON "Appointment"("studioId");
CREATE INDEX "Attendance_studioId_idx" ON "Attendance"("studioId");

ALTER TABLE "User" ADD CONSTRAINT "User_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Service" ADD CONSTRAINT "Service_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
