import fs, { promises as fsPromises } from "fs";
import path, { dirname } from "path";
import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from "../config.ts"
import { analyzeDemo, DemoSource, ExportFormat } from '@akiver/cs-demo-analyzer';
import { progress } from "./progressUtils.ts";

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

const onError = (demo, err: any) => {
	errors.push({
		name: demo.name,
		error: err
	});
	console.warn(err)
}
const onStart = (demo) => {
	progress(`StartedAnalyzing`,demosAnalyized, demos.length, demo.name);
}
const onEnd = (demo, exitCode: number) => {
	if( exitCode === 0) {
		fs.unlinkSync(demo.path + '/' + demo.name);
	} else {
		if (!fs.existsSync(config.downloadPath + "/failedToParse")) {
			console.info(`Creating directory /failedToParse`);
			fs.mkdirSync(config.downloadPath + "/failedToParse");
		}
		fs.rename(`${config.downloadPath}/${demo.name}`, `${config.downloadPath}/failedToParse/${demo.name}`, (err) => {
			if (err) console.warn(`Error moving file /failedToParse/${demo.name} : `, err);
		});
	}
}

export const processDemosThroughAnalyzer = async () => {
	const demos = (await fsPromises.readdir(`${config.downloadPath}unzipped`, { withFileTypes: true })).filter( demo => demo.name.endsWith(".dem") );
	console.info(`Starting Demo Analyzer, Found: ${demos.length} `);
	let demosAnalyized = 0;

	const errors: { name: any; error: string; }[] = [];

	const demoPromises = demos.map(async (demo: any) => {
		parseLimit(async () => {
			processIndividualDemo(demo);
			demosAnalyized++;
			progress(`Completed Analysis`, demosAnalyized, demos.length, demo.name);
		});
	})
	
	await Promise.allSettled(demoPromises).then(() => {
		if(errors.length > 0) {
			console.error("Errors: ", JSON.stringify(errors));
		}
		console.info( demos.length ? "Finished Parsing!" : "Nothing to parse, moving to Processing..");
	});

}

export const processIndividualDemo = async ( demoPath ) => {
	const demoName = demoPath.split("/").at(-1);
	return await analyzeDemo({
		demoPath: demoPath,
		outputFolderPath: './out',
		format: ExportFormat.JSON,
		source: DemoSource.FaceIt,
		analyzePositions: false,
		minify: true,
		onStderr: (err) => onError({ name:demoName }, err),
		//onStdout: console.log,
		onStart: () => console.info(`Started Analyzing ${demoName}`),
		onEnd: (exitCode: number) => {
			if( exitCode === 0) {
				fs.unlinkSync(demoPath);
			} else {
				if (!fs.existsSync(config.downloadPath + "/failedToParse")) {
					console.info(`Creating directory /failedToParse`);
					fs.mkdirSync(config.downloadPath + "/failedToParse");
				}
				fs.rename(`${config.downloadPath}/${demoName}`, `${config.downloadPath}/failedToParse/${demoName}`, (err) => {
					if (err) console.warn(`Error moving file /failedToParse/${demoName} : `, err);
				});
			}
		}
	});
}
 
//moveDemosAndStartParser();
//processDemosThroughAnalyzer();