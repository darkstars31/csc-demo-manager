-- DropForeignKey
ALTER TABLE "Match_Player_Stat" DROP CONSTRAINT "Match_Player_Stat_csc_match_id_fkey";

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "csc_match_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Match_Player_Stat" ALTER COLUMN "csc_match_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Match_Player_Stat" ADD CONSTRAINT "Match_Player_Stat_csc_match_id_fkey" FOREIGN KEY ("csc_match_id") REFERENCES "Match"("csc_match_id") ON DELETE SET NULL ON UPDATE CASCADE;
