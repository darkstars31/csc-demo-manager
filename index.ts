import { downloadDemos } from "./src/demodownloader.ts"
import { unzipFiles } from "./src/fileUnzipper.ts";
import { moveDemosAndStartParser, processDemosThroughAnalyzer } from "./src/demoparser.ts";
import { processIndividualMatchData } from "./src/processIndividualMatches.ts";
import { processAggregatedDataset } from "./src/process.ts";
import { downloadDemoAnalyzerCLI } from "./src/downloadDemoAnalyzer.ts";


const args = process.argv.slice(2);
console.info(args);


export const main = async () => {
	console.time("execution time");

	if( !args[0] || args[0] === "" ) {
		console.error(`No args provided, please provide s3 bucket path for demos. (Example 's15/M01')`);
		process.exit(1);
	}

	await downloadDemoAnalyzerCLI();

	await downloadDemos();

	await unzipFiles();

	//await moveDemosAndStartParser();
	await processDemosThroughAnalyzer();

	await processIndividualMatchData();
	await processAggregatedDataset();

	console.timeEnd("execution time");
	console.info("Finished");

};

main();