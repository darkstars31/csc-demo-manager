import { main } from "./index.ts"

const minutesToRepeat = 15;

(() => {
    console.info(`Starting watcher, ${minutesToRepeat} minute cycle...`)
    setInterval(() => {
        console.info("Starting main...");
        main();
        console.info("Sleeping...");
    }, 1000 * 60 * minutesToRepeat);
}
)()