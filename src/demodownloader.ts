import fs from "fs";
import { config } from "../config.ts";
import { promisifiedRecursiveNavigate } from "./s3BucketRecursiveNavigation.ts";
import { logger } from "../logger.ts";
import axios from "axios";
import { demoHistoryDB } from "../lowdb-wrapper.ts";
import pLimit from "p-limit";
import { progress } from "./progressUtils.ts";

const args = process.argv.slice(2);
const fileDownLoadlimit = pLimit(8);

export const doesFileAlreadyExist = (filePath?: string) => {
	return fs.existsSync( filePath ?? "" );
}

const parseDemoUrl = (url: string) => ({
	season: url.split("/").at(-3),
	matchDay: url.split("/").at(-2),
	file: {
		homeTeam: url.split("/").at(-1)?.split("-")[2],
		awayTeam: url.split("/").at(-1)?.split("-")[4],
		matchId: url.split("/").at(-1)?.split("-")[5],
		map: url.split("/").at(-1)?.split("-")[6],
		date: url.split("/").at(-1)?.split("-")[7],
	}
})

export const downloadFile = async (demoUrl: string, destinationPath: string) => {
	console.info(`Downloading ... ${demoUrl.split("/").at(-1)}`);
	try {
		const response = await axios.get(config.url + demoUrl, { responseType: 'stream', headers: { "accept-encoding": "gzip, deflate, br" } });
		const writer = fs.createWriteStream(destinationPath + `${demoUrl.split("/").at(-1)}`);

		response.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on('finish', () => {
                demoHistoryDB.data.push({ fileName: demoUrl, fullUrl: config.url + demoUrl, date: new Date()});
                demoHistoryDB.write();
				resolve(1);
			});
			writer.on('error', () =>
				resolve(0)
			);
		});
	} catch (error: any) {
		fs.appendFile(config.downloadPath + config.errorLog, `Failed to download ${demoUrl}\n ${error.message}\n`, (err) => { console.info('Failed to download demo', err) });
		//throw new Error(`File ${demoUrl} download failed: ${error.message}`);
	}
};

export const downloadFiles = async (filesToProcess: any[]) => {
    await demoHistoryDB.read();

	let downloadProgress = 0;
	const promisesList: Promise<any>[] = filesToProcess
		.filter(file => !doesFileAlreadyExist( config.downloadPath + file.Key[0].split("/").at(-1)))
        .filter(file => !demoHistoryDB.data.find( (history: { fileName: any; }) => history.fileName === file.Key[0]))
		.map((file: any, index: number) => {
			const demoUrl = file.Key[0];
			return fileDownLoadlimit(() => 
					downloadFile(demoUrl, config.downloadPath
				).then( () => { 
					downloadProgress++; 
					progress("Downloading Demos", downloadProgress, filesToProcess.length);
				}
			));
		});

	const results = await Promise.all(promisesList);
	logger.info(`\n`);
	logger.info(`Successful: ${results.filter(result => result === 1).length} Errors: ${results.filter(result => result === 0).length}`);
	return results;
}

export const downloadDemos = async() => {
 
    const s3BucketResult = {
        files: [],
        numFiles: 0,
    };

    const demos: any = await promisifiedRecursiveNavigate(args ? args[0] : ``, s3BucketResult);

    const filesToDownload: any[] = demos.files.filter((file: any) => file.Key[0].includes(".zip"));

    return await downloadFiles(filesToDownload);
}

//downloadDemos();
