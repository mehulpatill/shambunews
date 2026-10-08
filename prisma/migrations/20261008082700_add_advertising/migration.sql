-- CreateTable
CREATE TABLE "AdSetting" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'NONE',
    "publisherId" TEXT,
    "homepageTopSlot" TEXT,
    "homepageMidSlot" TEXT,
    "articleTopSlot" TEXT,
    "articleBottomSlot" TEXT,
    "sidebarSlot" TEXT,
    "homepageTopCode" TEXT,
    "homepageMidCode" TEXT,
    "articleTopCode" TEXT,
    "articleBottomCode" TEXT,
    "sidebarCode" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdSetting_pkey" PRIMARY KEY ("id")
);
