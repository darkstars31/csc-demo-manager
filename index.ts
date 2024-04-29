import { downloadDemos } from "./demodownloader.ts"
import { unzipFiles } from "./fileUnzipper.ts";
import { moveDemosAndStartParser, processDemosThroughAnalyzer } from "./demoparser.ts";
import { readCSVs, readJsons } from "./processMatchData.ts";
import { downloadDemoAnalyzerCLI } from "./downloadDemoAnalyzer.ts";


const args = process.argv.slice(2);
console.info(args);


const main = async () => {
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