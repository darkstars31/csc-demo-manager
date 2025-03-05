import { downloadFile, filterExistingProcessedMatchDemos, findDemosToDownload } from "./src/demodownloader.ts"
import { unzipFile } from "./src/fileUnzipper.ts";
import { analyzeIndividualDemo } from "./src/demoparser.ts";
import { processFileData } from "./src/processIndividualMatches.ts";
import { processAggregatedDataset } from "./src/process.ts";
import { promisify } from "util";
import { exec } from 'child_process';
import pLimit from "p-limit"
import { config } from "./config.ts";
import { progress } from "./src/progressUtils.ts";
import fs from "fs";
import { prisma } from "./prisma-wrapper.ts";

const execPromise = promisify(exec);
const limit = pLimit(2);

const ifErrorLog = (json: { error?: { message: string } }) =>  json.error ? console.error(json.error) : false;

const args = process.argv.slice(2);
console.info(args);

type s3BucketItem = {
	Key: string[],
	LastModified: Date
	Size: string[]
}

export const main = async () => {
	console.time("execution time");

	if( !args[0] || args[0] === "" ) {
		console.error(`No args provided, please provide s3 bucket path for demos. (Example 's15/M01')`);
		process.exit(1);
	}

	if( !fs.existsSync(config.downloadPath) ){

	}

	//const currentSeasonAndTiers = await fetchCurrentSeasonAndTiers();
	const existingMatches = await prisma.extendedMatches.findMany({ select: { matchId: true, matchType: true }});
	const filesToDownload = await findDemosToDownload();
	const filteredFiles = filesToDownload
		.filter(file => !["Scrim","scrim", "P0"].some( s => file.Key[0].includes(s)))
		.filter(file => !filterExistingProcessedMatchDemos(existingMatches, file));
	process.stdout.write(`\nNew Demos detected: ${filteredFiles.length}`);
	let seasonFromFilePath: number = 16;
	let completed = 0;
	let errors: string[] = [];
	const demoPromises = filteredFiles.map(async (file: s3BucketItem) => {
		// WEB HOOKING?
		// BETTER DEMO FAILURE HANDLING
		const filePath = file.Key[0];
		return new Promise(async (resolve, reject) => {
			try {
				await limit( async () => {
					seasonFromFilePath = Number(filePath.split("/")[0].replace("s", ""));
					const demoZipFilePath = await downloadFile(filePath, config.downloadPath)				
					const unzippedFilePath = await unzipFile(demoZipFilePath as string);
					await analyzeIndividualDemo(unzippedFilePath);
					const parsedDemoFileJson = demoZipFilePath.split("/").at(-1).replace(".dem.zip", ".json")
					await processFileData(parsedDemoFileJson, { number: seasonFromFilePath.toString() });
					completed++;
					progress(`Completed:`, completed, filteredFiles.length);
					resolve(true);
				})
			} catch (error) {
				errors.push(filePath);
				reject(error);
			}
		})
	});
	await Promise.allSettled(demoPromises);

	if ( errors.length > 0 ) {
		console.error("Errors: ", errors);
	}

	if ( completed > 0 ) {
		await processAggregatedDataset(seasonFromFilePath, "Combine");
		await processAggregatedDataset(seasonFromFilePath, "Regulation");
	} else {
		process.stdout.write(`\nNothing to aggregate, no new files detected.`);
	}

	console.timeEnd("execution time");
	console.info("Finished");

};

main();

export const fetchCurrentSeasonAndTiers = async () => await fetch(`https://core.csconfederation.com/graphql`,
	{ method: "POST", 
			body: JSON.stringify({
				"operationName": "LatestActiveSeason",
				"query": `query LatestActiveSeason {
					latestActiveSeason {
						number
						league {
							leagueTiers {
								tier {
									name
									mmrCap
									color
									mmrMin
									mmrMax
								}
							}
						}
					}
				}`,
				"variables": {}      
			}),
			headers: {
				'Content-Type': "application/json",
			}
		})
		.then( async response => {
			return response.json().then( (json) => {
				ifErrorLog(json);
				return json.data.latestActiveSeason;
			});
		} );