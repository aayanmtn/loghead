ALTER TABLE "user"
ADD COLUMN "plan" TEXT DEFAULT 'free' NOT NULL CHECK ("plan" IN ('free', 'paid'));
