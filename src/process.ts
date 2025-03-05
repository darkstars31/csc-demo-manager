import fs, { promises as fsPromises } from "fs";
import { prisma } from "../prisma-wrapper.ts";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import { CSDemoAnalysisOutput } from "../types/csdm-output.ts";
import { exit } from "process";
import { JsonValue } from "@prisma/client/runtime/library";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const currentSeason = 16

function combineBySummingKeys(objA: Record<string, number>, objB: Record<string, number>) { 
	const mergedObj = {}; 
   
	Object.keys(objA).forEach((key) => {
	  if( !objA.hasOwnProperty(key) && objB.hasOwnProperty(key) ) (mergedObj as Record<string,number>)[key] = 0;
	  (mergedObj as Record<string,number>)[key] = objA[key] + (objB[key] || 0); 
	}); 

	Object.keys(objB).forEach((key) => {
		if( !objB.hasOwnProperty(key) && objA.hasOwnProperty(key) ) (mergedObj as Record<string,number>)[key] = 0;
		(mergedObj as Record<string,number>)[key] = objB[key] + (objA[key] || 0); 
	  }); 
   
	return mergedObj; 
  }

export const processAggregatedDataset = async ( season: number, matchType: string) => {

	const calculated: { 
		name: any; 
		crosshairShareCode: "", 
		chickens: Record<string,number>,
		durationAverages: Record<string,number>,
		averages: Record<string,number>;
		trackedObj: Record<string, number>; 
		weaponKills: Record<string, number>; 
		weaponKillSubTypes: Record<string, number>; 
		hitboxTags: Record<string, number>; 
	}[] = [];

	console.info('season', season, 'matchType', matchType)
	const matchData = await prisma.extendedMatches.findMany({ where: { season: season, matchType: matchType } });
	if( !matchData ) return
	//console.info('matchData', typeof matchData?.[0]?.data, matchData.length)

	// const throughMatchDay = files.reduce((acc: number, file: any) => {
	// 	const matchDay = file.name.split("-")[1].replace("M", "");
	// 	return +matchDay > acc ? matchDay : acc
	// }, 0);
	
	process.stdout.write('\n')
	matchData.map( (m) => m.data).forEach( (matchJson: JsonValue, index: number) => {
		const json = matchJson as unknown as CSDemoAnalysisOutput;
		process.stdout.write(`\rProcessing Extended ${(index/matchData.length*100).toFixed(2)}%`);
		const players = json.players as any;
		const kills: Record<string, unknown>[] = json.kills as any;
		const bombsPlanted: Record<string, unknown>[] = json.bombsPlanted as any;
		const bombsDefused: Record<string, unknown>[] = json.bombsDefused as any;
		const playersFlashed: Record<string, unknown>[] = json.playersFlashed as any;
		const damages: Record<string, unknown>[] = json.damages as any;

		Object.values(players as any).forEach( (player: any) => {
			const analytiSkill: Record<string, number> = {
				openDuel: 0,
				trading: 0,
				assists: 0,
				retakes: 0,
				afterplant: 0,
				clutching: 0,
				midround: 0,
				saving: 0,
				util: 0,
			}
			const trackedObj: Record<string, number> = {
				//weaponInspects: player.inspectWeaponCount,
				noScopesKills: 0,
				wallBangKills: 0,
				smokeKills: 0,
				blindedKills: 0,
				airborneKills: 0,
				bombsPlanted: 0,
				bombPlantsStarted: 0,
				bombsDefused: 0,
				diedToBomb: 0,
				ninjaDefuses: 0,
				teamKills: 0,
				selfKills: 0,
				movingWhileInaccurate: 0,
				mvpCount: player.mvpCount,
			};
			const averages: Record<string,number> = {
				pistolRoundKillAverageCt: 0,
				pistolRoundKillAverageT: 0,
			}
			const durations: Record<string,number[]> = {
				selfFlashDurations: [],
				teamFlashDurations: [],
				enemyFlashDurations: [],
			}
			const econ = {
				pistolRoundWinPercentage: 0,
				ecoBuyRoundWinPercentage: 0,
				halfBuyRoundWinPercentage: 0,
				fullBuyRoundWinPercentage: 0,
				buysHelmetOnCtAgainstFullBuyTRounds: 0,
				buysDefuserOnCtSidePercentage: 0,
			}
			const chickens = {
				"killed": 0,
				"roasted": 0,
				"exploded": 0,
				"shot": 0,
				"stabbed": 0,
			};
			const weaponKills: Record<string, number> = {};
			const weaponKillSubTypes: Record<string, number> = {
				melee: 0,
				rifle: 0,
				smg: 0,
				sniper: 0,
				shotgun: 0,
				pistol: 0,
				grenade: 0,
			};

			// const thrownGrenadeTotals: {
			// 	smoke: 0,
			// 	flash: 0,
			// 	he: 0,
			// 	incendiary: 0,
			// 	molotov: 0,
			// 	decoy: 0,
			// }
			
			const hitboxTags: Record<string, number> = {
				Generic: 0,
				Head: 0,
				Chest: 0,
				Stomach: 0,
				LeftArm: 0,
				RightArm: 0,
				LeftLeg: 0,
				RightLeg: 0,
				Neck: 0,
			};

			kills.forEach( (kill: any) => {
				if( kill.killerSteamId === player.steamId ) {
					if(! weaponKills[kill.weaponName]) {
						weaponKills[kill.weaponName] = 0
					}
					weaponKills[kill.weaponName] = weaponKills[kill.weaponName] + 1;

					weaponKillSubTypes[kill.weaponType] += 1;

					if( kill.isNoScope ) {
						trackedObj.noScopesKills += 1;
					}
					if( kill.penetratedObjects > 0) {
						trackedObj.wallBangKills +=  1;
					}
					if( kill.isThroughSmoke ) {
						trackedObj.smokeKills += 1;
					}
					if( kill.is_killer_blinded ) {
						trackedObj.blindedKills += 1;
					}
					if( kill.is_killer_airborne ) {
						trackedObj.airborneKills += 1;
					}
					if( kill.killerSide === kill.victimSide && kill.killerSteamId !== kill.victimSteamId){
						trackedObj.teamKills += 1;
					}
					if( kill.killerSteamId === kill.victimSteamId && !kill.weaponType.includes('world')){
						trackedObj.selfKills +=1;
					}

					if( kill.roundNumber === 1 || kill.roundNumber === 13){
						kill.killerSide === 2
							? averages.pistolRoundKillAverageT += 1
							: averages.pistolRoundKillAverageCt += 1; 
					}
				}

				if( kill.victimSteamId === player.steamId && kill.weaponName === "C4" ) {
					trackedObj.diedToBomb += 1;
				}
			});

			playersFlashed.forEach( (flash: any) => {
				if( player.steamId === flash.flasherSteamId){
					if( flash.flasherSteamId === flash.flashedSteamId){
						durations.selfFlashDurations.push(flash.duration)
					} else {
						flash.flasherSide !== flash.flashedSide ?
						durations.enemyFlashDurations.push(flash.duration)
						: durations.teamFlashDurations.push(flash.duration)		
					}			
				}
			});

			bombsPlanted.forEach( (bomb: any) => {
				if( player.steamId === bomb.planterSteamId ) {
					trackedObj.bombsPlanted += 1;
				}
			});
			bombsDefused.forEach( (bomb: any) => {
				if( player.steamId === bomb.defuserSteamId ) {
					trackedObj.bombsDefused += 1;
					if( bomb.terroristAliveCount > 0 ){
						trackedObj.ninjaDefuses += 1;
					}
				}
			});

			(json.chickenDeaths as Record<string,unknown> as any).forEach( (death: any) => {
				if( player.steamId === death.killerSteamId ) {
					chickens.killed += 1;
					switch(death.weaponName) {
						case "HE Grenade":
							chickens.exploded += 1;
							break;
						case "Incendiary Grenade":
							chickens.roasted += 1;
							break;
						case "Knife":
							chickens.stabbed += 1;
							break;
						default:
							chickens.shot += 1;
							break;
					}
				}
			});

			if( damages ) {
				damages.forEach( (damage: any) => {
					if( player.steamId === damage.attackerSteamId ) {
						hitboxTags[Object.keys(hitboxTags)[damage.hitgroup]] += 1;
					}
				});
			}
			
			const playerIndex = calculated.findIndex( (p: { name: any; }) => p.name === player.name );
			
			if ( playerIndex === -1 ) {

				const durationAverages = {
					selfFlashDurationAverage: durations.selfFlashDurations.reduce((sum, item) => sum + item,0) / durations.selfFlashDurations.length || 0,
					teamFlashDurationAverage: durations.teamFlashDurations.reduce((sum,item) => sum + item,0) / durations.teamFlashDurations.length || 0,
					enemyFlashDurationAverage: durations.enemyFlashDurations.reduce((sum,item) => sum + item,0) / durations.enemyFlashDurations.length || 0,
				}

				calculated.push({ name: player.name, crosshairShareCode: player.crosshairShareCode, chickens, averages, durationAverages, trackedObj, weaponKills, weaponKillSubTypes, hitboxTags});
			} else {
				durations.selfFlashDurations.push(calculated[playerIndex].durationAverages.selfFlashDurationAverage)
				durations.teamFlashDurations.push(calculated[playerIndex].durationAverages.teamFlashDurationAverage)
				durations.enemyFlashDurations.push(calculated[playerIndex].durationAverages.enemyFlashDurationAverage)
				
				const durationAverages = {
					selfFlashDurationAverage: durations.selfFlashDurations.reduce((sum, item) => sum + item,0) / durations.selfFlashDurations.length,
					teamFlashDurationAverage: durations.teamFlashDurations.reduce((sum,item) => sum + item,0) / durations.teamFlashDurations.length,
					enemyFlashDurationAverage: durations.enemyFlashDurations.reduce((sum,item) => sum + item,0) / durations.enemyFlashDurations.length,
				}

				calculated[playerIndex].durationAverages = durationAverages;
				calculated[playerIndex].averages.pistolRoundKillAverageCt = (calculated[playerIndex].averages.pistolRoundKillAverageCt + averages.pistolRoundKillAverageCt)/2
				calculated[playerIndex].averages.pistolRoundKillAverageT = (calculated[playerIndex].averages.pistolRoundKillAverageT + averages.pistolRoundKillAverageT)/2
				calculated[playerIndex].chickens = combineBySummingKeys(calculated[playerIndex].chickens, chickens);
				calculated[playerIndex].trackedObj = combineBySummingKeys(calculated[playerIndex].trackedObj, trackedObj);
				calculated[playerIndex].weaponKills = combineBySummingKeys(calculated[playerIndex].weaponKills, weaponKills);
				calculated[playerIndex].weaponKillSubTypes = combineBySummingKeys(calculated[playerIndex].weaponKillSubTypes, weaponKillSubTypes);
				calculated[playerIndex].hitboxTags = combineBySummingKeys(calculated[playerIndex].hitboxTags, hitboxTags);
			}
		
		})
	});

	const existingMatchesProcessed = await prisma.extendedStats.findFirst({ where: { season: currentSeason, matchType: matchType }, select: { metadata: true }, orderBy: { createdAt: 'desc' } }) as Record<string,any>;

	console.info( matchData.length, '=', existingMatchesProcessed.metadata.matchesProcessed );
	if( existingMatchesProcessed.data === undefined ||
		existingMatchesProcessed?.metadata && 
		typeof existingMatchesProcessed == "object" &&
		existingMatchesProcessed.metadata.matchesProcessed !== matchData.length ) {
			// await prisma.extendedStats.create({
			// 	data: {
			// 		matchType: matchType,
			// 		season: currentSeason,
			// 		data: calculated,
			// 		metadata: {
			// 			matchesProcessed: matchData.length
			// 		}
			// 	}
			// });
		console.info( `\nFinished Aggregating. New matches (${existingMatchesProcessed.metadata.matchesProcessed - matchData.length}) detected and uploaded to the db.\n\t` );		
	} else {
		console.info( `\nFinished Aggregating Match Data, no changes detected.\n\t` );
	}
}
