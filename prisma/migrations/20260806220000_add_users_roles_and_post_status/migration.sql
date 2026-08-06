-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PUBLISHED', 'PENDING', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Seed Meghna's admin account (existing content is backfilled to her below)
INSERT INTO "User" ("id", "email", "name", "passwordHash", "role")
VALUES (
    'd952ee8b-41c7-4744-bf64-bfd8e5793827',
    'itismeghna@gmail.com',
    'Meghna Mane',
    '$2b$10$DfbYtm13gTIkiIOFuWR/1e1VQwXg.wOh4HcPxXKrhMrtQrfllTAKi',
    'ADMIN'
);

-- AlterTable: Post gains authorId + status, backfilled to Meghna / PUBLISHED
ALTER TABLE "Post" ADD COLUMN "authorId" TEXT;
ALTER TABLE "Post" ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'PUBLISHED';
UPDATE "Post" SET "authorId" = 'd952ee8b-41c7-4744-bf64-bfd8e5793827' WHERE "authorId" IS NULL;
ALTER TABLE "Post" ALTER COLUMN "authorId" SET NOT NULL;
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Comment gains userId (replacing the free-text name), backfilled to Meghna
ALTER TABLE "Comment" ADD COLUMN "userId" TEXT;
UPDATE "Comment" SET "userId" = 'd952ee8b-41c7-4744-bf64-bfd8e5793827' WHERE "userId" IS NULL;
ALTER TABLE "Comment" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Comment" DROP COLUMN "name";
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
