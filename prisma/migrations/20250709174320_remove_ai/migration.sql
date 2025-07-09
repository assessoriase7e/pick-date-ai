/*
  Warnings:

  - You are about to drop the `AgentPrompt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AgentRagFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AgentRedisKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AgentWhatsapp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prompt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RagConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RagFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `additionalAICredit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `aiusage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attendantprompt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blacklist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blacklistphone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `followupprompt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questiontext` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rediskey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sdrprompt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `whatsapp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AgentPrompt" DROP CONSTRAINT "AgentPrompt_userId_fkey";

-- DropForeignKey
ALTER TABLE "AgentRagFile" DROP CONSTRAINT "AgentRagFile_userId_fkey";

-- DropForeignKey
ALTER TABLE "AgentRedisKey" DROP CONSTRAINT "AgentRedisKey_userId_fkey";

-- DropForeignKey
ALTER TABLE "AgentWhatsapp" DROP CONSTRAINT "AgentWhatsapp_userId_fkey";

-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_userId_fkey";

-- DropForeignKey
ALTER TABLE "RagFile" DROP CONSTRAINT "RagFile_userId_fkey";

-- DropForeignKey
ALTER TABLE "additionalAICredit" DROP CONSTRAINT "additionalAICredit_userId_fkey";

-- DropForeignKey
ALTER TABLE "aiusage" DROP CONSTRAINT "aiusage_userId_fkey";

-- DropForeignKey
ALTER TABLE "attendantprompt" DROP CONSTRAINT "attendantprompt_userId_fkey";

-- DropForeignKey
ALTER TABLE "blacklist" DROP CONSTRAINT "blacklist_userId_fkey";

-- DropForeignKey
ALTER TABLE "blacklistphone" DROP CONSTRAINT "blacklistphone_blackListId_fkey";

-- DropForeignKey
ALTER TABLE "followupprompt" DROP CONSTRAINT "followupprompt_userId_fkey";

-- DropForeignKey
ALTER TABLE "questiontext" DROP CONSTRAINT "questiontext_userId_fkey";

-- DropForeignKey
ALTER TABLE "rediskey" DROP CONSTRAINT "rediskey_userId_fkey";

-- DropForeignKey
ALTER TABLE "sdrprompt" DROP CONSTRAINT "sdrprompt_userId_fkey";

-- DropForeignKey
ALTER TABLE "whatsapp" DROP CONSTRAINT "whatsapp_userId_fkey";

-- DropTable
DROP TABLE "AgentPrompt";

-- DropTable
DROP TABLE "AgentRagFile";

-- DropTable
DROP TABLE "AgentRedisKey";

-- DropTable
DROP TABLE "AgentWhatsapp";

-- DropTable
DROP TABLE "Prompt";

-- DropTable
DROP TABLE "RagConfig";

-- DropTable
DROP TABLE "RagFile";

-- DropTable
DROP TABLE "additionalAICredit";

-- DropTable
DROP TABLE "aiusage";

-- DropTable
DROP TABLE "attendantprompt";

-- DropTable
DROP TABLE "blacklist";

-- DropTable
DROP TABLE "blacklistphone";

-- DropTable
DROP TABLE "followupprompt";

-- DropTable
DROP TABLE "questiontext";

-- DropTable
DROP TABLE "rediskey";

-- DropTable
DROP TABLE "sdrprompt";

-- DropTable
DROP TABLE "whatsapp";
