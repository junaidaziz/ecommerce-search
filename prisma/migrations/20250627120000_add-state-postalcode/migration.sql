-- Add state and postalCode columns to User
ALTER TABLE "User" ADD COLUMN "state" TEXT;
ALTER TABLE "User" ADD COLUMN "postalCode" TEXT;
