import fs, { promises as fsPromises } from "fs";
import papa from "papaparse";
import { prisma } from "../prisma-wrapper.ts";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const readCSVs = async () => {
	const files = fs.readdirSync(`${__dirname}/demoScrape2/out`);
	const csvFiles = files.filter((file: any) => file.endsWith(".csv"));
	console.info(`Found ${csvFiles.length} CSV files`);
    let skipCount = 0;

	for( const [index, csv] of csvFiles.entries()){
		const json = papa.parse<any>( await fsPromises.readFile(`${__dirname}/demoScrape2/out/${csv}`, "utf8"), { header: true }).data;
		const cleanedUpPlayerStats = json.filter((item: any) => !!item.steam);

		const uniqueMatchId = uuidv4();

        const ctRoundsWon = Number(json[0]["ADR"]);
        const tRoundsWon = Number(json[0]["KAST"]);

		const fileNameNoExt = csv.split(".")[0].split("_")[0];
		const date = new Date(csv.split(".")[0].split("_")[1]);

		const matchInfo: any = cleanedUpPlayerStats.at(0);
		const server = fileNameNoExt.split("-")[0];
		const csc_match_id = fileNameNoExt.split("-")[1].replace("mid", "") || null;

        if( ctRoundsWon < 16 && tRoundsWon < 16) {
            console.info(`skipping ${server} ${csc_match_id} ctRoundsWon: ${ctRoundsWon}, tRoundsWon: ${tRoundsWon}`);
            skipCount++;
            continue;
        }

        console.info(`Processing ${csv} | mid: ${csc_match_id} - ${index} / ${csvFiles.length}`);
		const result = await prisma.match.create({
			data: {
				type: "Preseason",
				matchStartTime: date,
				server: server,
				match_uuid: uniqueMatchId,
				csc_match_id: csc_match_id || null,
				Map: matchInfo.Map
			}
		});

		for (const x of cleanedUpPlayerStats) {
			const player: Record<string, any> = x as unknown as Record<string, any>;
			await prisma.match_Player_Stat.create({
				data: {
					csc_match_id: csc_match_id ?? null,
					match_uuid: uniqueMatchId,
					Map: matchInfo.Map,
					Team: player.Team,
					steam: player.steam,
					Name: player.Name,
					Rating: Number(player.Rating),
					Kills: Number(player.Kills),
					Assists: Number(player.Assists),
					Deaths: Number(player.Deaths),
					ADR: Number(player.ADR),
					KAST: Number(player.KAST),
					Impact: Number(player.Impact),
					CT: Number(player.CT),
					T: Number(player.T),
					ADP: Number(player.ADP),
					SuppR: Number(player.SuppR),
					SuppX: Number(player.SuppX),
					UD: Number(player.UD),
					EF: Number(player.EF),
					F_Ass: Number(player.F_Ass),
					Util: Number(player.Util),
					HS: Number(player.HS),
					AWP_K: Number(player.AWP_K),
					F_Kills: Number(player.F_Kills),
					F_Deaths: Number(player.F_Deaths),
					Entries: Number(player.Entries),
					Saves: Number(player.Saves),
					Trades: Number(player.Trades),
					Traded: Number(player.Traded),
					twoK: Number(player["2k"]),
					threeK: Number(player["3k"]),
					fourK: Number(player["4k"]),
					fiveK: Number(player["5k"]),
					cl_1v1: Number(player["1v1"]),
					cl_1v2: Number(player["1v2"]),
					cl_1v3: Number(player["1v3"]),
					cl_1v4: Number(player["1v4"]),
					cl_1v5: Number(player["1v5"]),
					Rounds: Number(player.Rounds),
					RF: Number(player.RF),
					RA: Number(player.RA),
					Damage: Number(player.Damage),
					XTaken: Number(player.XTaken),
					ATD: Number(player.ATD),
					ADP_CT: Number(player["ADP-CT"]),
					ADP_T: Number(player["ADP-T"]),
					Smokes: Number(player.Smokes),
					Flashes: Number(player.Flashes),
					Fires: Number(player.Fires),
					Nades: Number(player.Nades),
					FireX: Number(player.FireX),
					NadeX: Number(player.NadeX),
					EFT: Number(player.EFT),
					RWK: Number(player.RWK),
					IWR: Number(player.IWR),
					KPA: Number(player.KPA),
					tOL: Number(player.tOL),
					ctOK: Number(player.ctOK),
					ctOL: Number(player.ctOL),
					tRounds: Number(player.tRounds),
					tRF: Number(player.tRF),
					ctAWP: Number(player.ctAWP),
					ctK: Number(player.ctK),
					lurks: Number(player.lurks),
					WLP: Number(player.WLP),
					MIP: Number(player.MIP),
				}
			})
		}
	}
    console.info(`SkipCount: ${skipCount}`);
	console.info(`Processing Finished`);

}


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

export const readJsons = async () => {

	const existingMatchIds = await prisma.extendedMatches.findMany({ select: { matchId: true }});
	let matchesAdded = 0;
	let matchesSkipped = 0;

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

	const files = await fsPromises.readdir(`out`, { withFileTypes: true });
	const dataFromFiles = []
	const throughMatchDay = files.reduce((acc: number, file: any) => {
		const matchDay = file.name.split("-")[1].replace("M", "");
		return +matchDay > acc ? matchDay : acc
	}, 0);
	for (const file of files){
		const fileData = fs.readFileSync(`out/${file.name}`, "utf8");
		const jsonFileData = JSON.parse( fileData );
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
			damages,
			...rest
		} = copy;

		const matchType = file.name.split("-")[0].includes("combine") ? "Combine" : "Regulation";
		const matchId = file.name.split("-")[matchType.includes("Combine") ? 2 : 5].replace("mid", "");
		const tier = matchType.includes("Combine") ? file.name.split("-")[1] : 'unknown';
		const map = file.name.split("-")[matchType.includes("Combine") ? 3 : 6].replace("0_de_", "");

		if( !existingMatchIds.some(match => match.matchId === matchId) ) {
			await prisma.extendedMatches.create({
				data: {
					matchId: matchId,
					tier: tier,
					map: map,
					matchDay: matchType === "Regulation" ? +file.name.split("-")[1].replace("M", "") : null,
					season: 15, //+file.name.split("-")[0].replace("s", ""),
					matchType: matchType,
					data: { ...rest }
				}
			})
			matchesAdded++;
		} else {
			matchesSkipped++;
		}
		process.stdout.write(`\rProcessing Individual Matches ${(matchesAdded+matchesSkipped/files.length*100).toFixed(2)}%`);
		dataFromFiles.push(jsonFileData);
	}
	process.stdout.write('\n')
	dataFromFiles.forEach( (json, index) => {
		process.stdout.write(`\rProcessing Extended ${(index/dataFromFiles.length*100).toFixed(2)}%`);
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

			damages.forEach( (damage: any) => {
				if( player.steamId === damage.attackerSteamId ) {
					hitboxTags[Object.keys(hitboxTags)[damage.hitgroup]] += 1;
				}
			});

			
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
	if( matchesAdded > 0 ) {
		await prisma.extendedStats.create({
			data: {
				matchType: 'Combine',
				season: 15,
				data: calculated
			}
		});
	}

	console.info( `\nFinished Processing Match Data.\n\t Added: ${matchesAdded} \n\t Pre-Existing: ${matchesSkipped}` );
}

//readCSVs();
//readJsons();