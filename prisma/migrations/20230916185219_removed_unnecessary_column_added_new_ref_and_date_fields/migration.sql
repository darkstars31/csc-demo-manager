/*
  Warnings:

  - You are about to drop the column `m_ID` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `matchid` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `m_ID` on the `Match_Player_Stat` table. All the data in the column will be lost.
  - You are about to drop the column `match_id` on the `Match_Player_Stat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[match_uuid]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `matchStartTime` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `match_uuid` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `server` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `match_uuid` to the `Match_Player_Stat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" RENAME COLUMN "m_ID" TO "match_uuid";
ALTER TABLE "Match" DROP COLUMN "matchid",
ADD COLUMN     "matchStartTime" TIMESTAMP NULL,
ADD COLUMN     "server" VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE "Match_Player_Stat" RENAME COLUMN "m_ID" TO "match_uuid";
ALTER TABLE "Match_Player_Stat" DROP COLUMN "match_id";

-- CreateIndex
CREATE UNIQUE INDEX "Match_match_uuid_key" ON "Match"("match_uuid");

-- AddForeignKey
ALTER TABLE "Match_Player_Stat" ADD CONSTRAINT "Match_Player_Stat_match_uuid_fkey" FOREIGN KEY ("match_uuid") REFERENCES "Match"("match_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
