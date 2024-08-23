import { config } from "./config";
import { downloadFile } from "./src/demodownloader";
import { promisifiedRecursiveNavigate } from "./s3BucketRecursiveNavigation";
import pLimit from "p-limit";

const args = process.argv.slice(2);
const concurrency = pLimit(4);

const execute = async () => {}

export const agile = async () => {

    const s3BucketResult = {
        files: [],
        numFiles: 0,
    };

    const demos: any = await promisifiedRecursiveNavigate(args ? args[0] : ``, s3BucketResult);

    const filesToDownload: any[] = demos.files.filter((file: any) => file.Key[0].includes(".zip"));

    const filesToProcess = filesToDownload.map( file => concurrency( async () => {
        const result = await downloadFile(file,  config.downloadPath, "");
        

    });
 
}