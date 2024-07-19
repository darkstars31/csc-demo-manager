import fs, { promises as fsPromises } from "fs";
import path, { dirname } from "path";
import { exec } from 'child_process';
import { promisify } from 'util';
import papa from "papaparse";
import { prisma } from "./prisma-wrapper.ts"
import { config } from "./config.ts"
import { analyzeDemo, DemoSource, ExportFormat } from '@akiver/cs-demo-analyzer';

import { fileURLToPath } from 'url';
import pLimit from "p-limit";

const promiseExec = promisify(exec);
const parseLimit = pLimit(8);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const copyDir = async (src: string, dest: string) => {
	await fsPromises.mkdir(dest, { recursive: true });
	let entries = await fsPromises.readdir(src, { withFileTypes: true });

	for (let [index, entry] of entries.entries()) {
		process.stdout.clearLine(0);
		console.info(`\rCopying ${index + 1} of ${entries.length}`);
		let srcPath = path.join(src, entry.name);
		let destPath = path.join(dest, entry.name);

		entry.isDirectory() ?
			await copyDir(srcPath, destPath) :
			await fsPromises.copyFile(srcPath, destPath);
	}
}

export const moveDemosAndStartParser = async () => {
	console.info("Moving Demo Files to DemoScrape In directory..");
	//await copyDir(`${config.downloadPath}/unzipped`, `${__dirname}/demoScrape2/in`);

	console.info("Starting Demo parser");
	return new Promise((resolve, reject) => {
		exec(`go run .`, { cwd: `${__dirname}/demoScrape2` }, (err: any, stdout: any, stderr: any) => {
			if (err) {
				console.error(`Error with stats parser\n ${err}`);
				console.error(stderr);
				return;
			}

			resolve(stdout.trim());
		});
	});
}

export const processDemosThroughAnalyzer = async () => {
	console.info("Starting Demo Analyzer");
	const demos = (await fsPromises.readdir(`${config.downloadPath}unzipped`, { withFileTypes: true })).filter( demo => demo.name.endsWith(".dem") );
	console.info("Demos Found: ", demos.length);
	let progress = 0;

	const errors: { name: any; error: string; }[] = [];

	const demoPromises = demos.map(async (demo: any) => 
		parseLimit(async () => {
			await analyzeDemo({
				demoPath: demo.path + '/' + demo.name,
				outputFolderPath: './out',
				format: ExportFormat.JSON,
				source: DemoSource.FaceIt,
				analyzePositions: false,
				minify: true,
				onStderr: (err) => {
					errors.push({
						name: demo.name,
						error: err
					});
					console.warn(err)
				},
				onStdout: console.log,
				onStart: () => {
				  console.log(`Starting ${demo.name}`);
				},
				onEnd: () => {
				  console.log(`Finished ${demo.name}`);
				  fs.unlinkSync(demo.path + '/' + demo.name);
				},
			  });
			progress++;
			console.info(`Completed Analysis ${demo.name}, ${progress}/${demoPromises.length}`)
		}
		));
	
	await Promise.allSettled(demoPromises).then(() => {
		if(errors.length > 0) {
			console.error("Errors: ", JSON.stringify(errors));
		}
		console.info("Done!");
	});
}
 
//moveDemosAndStartParser();
//processDemosThroughAnalyzer();