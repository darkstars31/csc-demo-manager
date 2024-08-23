import { downloadDemos } from "./src/demodownloader.ts"
import { unzipFiles } from "./src/fileUnzipper.ts";
import { moveDemosAndStartParser, processDemosThroughAnalyzer } from "./src/demoparser.ts";
import { readCSVs, readJsons } from "./src/processMatchData.ts";
import { downloadDemoAnalyzerCLI } from "./src/downloadDemoAnalyzer.ts";


const args = process.argv.slice(2);
console.info(args);


export const main = async () => {
	console.time("execution time");

	await downloadDemoAnalyzerCLI();

	await downloadDemos();

	await unzipFiles();

	//await moveDemosAndStartParser();
	await processDemosThroughAnalyzer();

	// await readCSVs();
	await readJsons();

	console.timeEnd("execution time");
	console.info("Finished");

};

main();