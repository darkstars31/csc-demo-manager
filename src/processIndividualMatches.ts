import fs, { promises as fsPromises } from "fs";
import { prisma } from "../prisma-wrapper.ts";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import { CSDemoAnalysisOutput } from "../types/csdm-output.ts";
import { fetchCachedCscPlayerStats } from "../dao/cscPlayerStatsDao.ts";
import { CscStats } from "../types/cscPlayerTierStats.ts";
import { demoFileIdentification } from "./file-identification-util.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const processIndividualMatchData = async () => {

	const existingMatchIds = (await prisma.extendedMatches.findMany({ select: { matchId: true }})).map(m => m.matchId);

	const files = await fsPromises.readdir(`out`, { withFileTypes: true });
	const newMatchFiles = files.filter( file => {
		const matchType = file.name.split("-")[0].includes("combine") ? "Combine" : "Regulation";
		const matchId = file.name.split("-")[matchType === "Combine" ? 2 : 5].replace("mid", "")
		return !existingMatchIds.includes(matchId)
	})
	let matchesAdded = 0
	let matchesSkipped = files.length - newMatchFiles.length;
	// const throughMatchDay = newMatchFiles.reduce((acc: number, file: any) => {
	// 	const matchDay = file.name.split("-")[1].replace("M", "");
	// 	return +matchDay > acc ? matchDay : acc
	// }, 0);
	for (const file of newMatchFiles){
		await processFileData(file.name);
		matchesAdded++;
		
		process.stdout.write(`\rProcessing Individual Matches ${(matchesAdded+matchesSkipped/files.length*100).toFixed(2)}%`);
	}
	process.stdout.write('\n')

	console.info( `\nFinished Processing Individual Match Data.\n\t Added: ${matchesAdded} \n\t Pre-Existing: ${matchesSkipped}` );
}


export const processFileData = async ( fileName: string, currentSeasonAndTiers: { number: string; } ) => {
	const fileMetadata = demoFileIdentification(fileName, currentSeasonAndTiers.number);
	const faceitPlayerData = (await prisma.faceitCache.findMany({ select: { steamId: true, elo: true }}));
	const currentSeason = Number(fileMetadata.season);

	const matchType = fileMetadata.isRegulation ? "Regulation" : "Combine";

	const cscPlayerStatsByTier: Record<string, CscStats[]> = {
		recruit: await fetchCachedCscPlayerStats("Recruit", currentSeason, matchType),
		prospect: await fetchCachedCscPlayerStats("Prospect", currentSeason, matchType),
		contender: await fetchCachedCscPlayerStats("Contender", currentSeason, matchType),
		challenger: await fetchCachedCscPlayerStats("Challenger", currentSeason, matchType),
		elite: await fetchCachedCscPlayerStats("Elite", currentSeason, matchType),
		premier: await fetchCachedCscPlayerStats("Premier", currentSeason, matchType),
	}
	const allCscPlayerStats = Object.values(cscPlayerStatsByTier).flat();

	const fileData = fs.readFileSync(`out/${fileName}`, "utf8");
		const jsonFileData = JSON.parse( fileData ) as CSDemoAnalysisOutput;
		const copy = { ...jsonFileData };
		const { 
			grenadeBounces, 
			grenadeProjectilesDestroy,
			heGrenadesExplode,
			flashbangsExplode,
			hostagePickUpStart,
			hostagePickedUp,
			hostageRescued,
			hostagePositions,
			infernoPositions,
			demoFilePath,
			smokesStart, 
			decoysStart,
			shots,
			...rest
		} = copy;

		const teamAPlayers = Object.values(copy.players).filter( player => player.team.letter === copy.teamA.letter);
		const teamBPlayers = Object.values(copy.players).filter( player => player.team.letter === copy.teamB.letter);

		const teamACSCRatingsAtMatch = teamAPlayers.map( player => allCscPlayerStats?.filter( (stats: { name: string; }) => stats.name === player.name).at(0)?.rating );
		const teamAFaceitElo = teamAPlayers.map( player => faceitPlayerData.filter( (stats: { steamId: string; }) => +stats.steamId === player.steamId).at(0)?.elo );
		const teamBCSCRatingsAtMatch = teamBPlayers.map( player => allCscPlayerStats?.filter( (stats: { name: string; }) => stats.name === player.name).at(0)?.rating );
		const teamBFaceitElo = teamBPlayers.map( player => faceitPlayerData.filter( (stats: { steamId: string; }) => +stats.steamId === player.steamId).at(0)?.elo );
		
		try {
			const extendedMatch = await prisma.extendedMatches.create({
				data: {
					matchId: fileMetadata.matchId,
					tier: fileMetadata.tier ?? "Unknown",
					map: fileMetadata.mapPlayed ?? "Unknown",
					matchDay: Number(fileMetadata.matchDay),
					season: Number(fileMetadata.season) ?? 0,
					matchType: matchType,
					data: { ...rest as any }, // by-pass the weird type error for jsonb
					metadata: {
						matchup: {
							teamACSCRatingsAtMatch,
							teamBCSCRatingsAtMatch,
							teamAFaceitElo,
							teamBFaceitElo
						}
					} as any // by-pass the weird type error for jsonb
				}
			})
			fs.unlink("out/" + fileName, (err) => { if (err) console.info(`Failure to unlink file: ${fileName}`, err) })
			return extendedMatch;
		} catch (error) {
			console.warn("Unable to save match to database", error);
			throw new Error("Unable to save match to database");
		}
		//TODO: Adde some kind of logging
}