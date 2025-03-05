import { main } from "./index-single.ts"
import { downloadDemoAnalyzerCLI } from "./src/downloadDemoAnalyzer.ts";

const minutesToRepeat = 5;
let runCount = 0;

( async () => {
    console.info(`Starting watcher, ${minutesToRepeat} minute cycle...`)
    await downloadDemoAnalyzerCLI();
    setInterval(() => {
        runCount++;
        console.info(`Starting main... Count ${runCount}`);
        try {
            main();
        } catch (error) {
            console.error(error);
        }
        console.info("Sleeping...");
    }, 1000 * 60 * minutesToRepeat);
}
)()