-- CreateTable
CREATE TABLE "SiteLogo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteLogo_pkey" PRIMARY KEY ("id")
);
