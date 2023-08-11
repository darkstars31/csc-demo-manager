import axios from "axios";
import xml2js from "xml2js"
import { fileURLToPath } from "url";
import fs, { promises as fsPromises } from "fs";
import { exec } from 'child_process';
import path, { dirname } from "path";
import pLimit from "p-limit";
import JSZip from "jszip";
import papa from "papaparse";
import pino from "pino";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { demoFileIdentification } from "./file-identification-util.js";

const directoryTraversalLimit = pLimit(1);
const fileDownLoadlimit = pLimit(4);
const unZipLimit = pLimit(8);

const config = {
	url: `https://cscdemos.nyc3.digitaloceanspaces.com/`,
	downloadPath: "D:/demofiles/",
	errorLog: "error.log",
}

const logger = pino();
const args = process.argv.slice(2);
console.info( args );

const copyDir = async (src: string, dest: string) => {
    await fsPromises.mkdir(dest, { recursive: true });
    let entries = await fsPromises.readdir(src, { withFileTypes: true });

    for (let [index, entry] of entries.entries()) {
		process.stdout.clearLine(0);
		console.info( `\rCopying ${index+1} of ${entries.length}` );
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory() ?
            await copyDir(srcPath, destPath) :
            await fsPromises.copyFile(srcPath, destPath);
    }
}

const recuriveNavigate = async (directory: any, result: any) => {
	const url = `${config.url}?delimiter=/&prefix=${directory}`;
	const { data } = await axios.get(url, { headers: { "Content-Type": "application/xml" } });

	const jsonizedResponse = await xml2js.parseStringPromise(data);
	const discoveredDirectories = jsonizedResponse.ListBucketResult.CommonPrefixes?.map((item: any) => item.Prefix[0]) ?? [];
	console.info(directory, " => ", discoveredDirectories);
	const files = jsonizedResponse.ListBucketResult.Contents?.map((item: any) => item) ?? [];

	if (files.length > 0 && !directory.includes("scrim") && !directory.includes("combines")) {
		result.files.push(...files);
		result.numFiles += files.length;
	}

	const promises = discoveredDirectories.map( (directory: any) => recuriveNavigate(directory, result));
	await Promise.all(promises)
	Promise.resolve(result);
};

  const promisifiedRecursiveNavigate = (directory: any, result: any) => {
    return new Promise((resolve: any, reject: any) => {
      recuriveNavigate(directory, result)
        .then(() => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  
  const downloadFile = async (demoUrl: string, destinationPath: string) => {
	console.info(`Downloading... ${demoUrl}`);
	try {
		const response = await axios.get(config.url + demoUrl, { responseType: 'stream', headers: { "accept-encoding": "gzip, deflate, br" } });
		const writer = fs.createWriteStream(destinationPath + `${demoUrl.split("/").at(-1)}`);

		response.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on('finish', () => {
				console.info(`Downloaded ${demoUrl}`);
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

const unzipFiles = async () => {
	return new Promise((resolve, reject) => {
		const files = fs.readdirSync(config.downloadPath);
		const zipFiles = files.filter((file: any) => file.endsWith(".zip"));
		const promises = zipFiles.map((file: any) => {
			return unZipLimit(() => unzipFile(config.downloadPath + file));
		});
		Promise.all(promises).then(() => {
			resolve(1);
		})
	});
}

const unzipFile = async ( filePath: string ) => {
	return new Promise( async (resolve, reject) => {
		const fullPath = filePath;
		const folderPathArray = filePath.split("/");
		const fileName = folderPathArray.at(-1);
		const matchDay = folderPathArray.at(-1)?.split("-")[1]!;
		const deets = demoFileIdentification(fileName!);

		console.info( Object.values(deets).join("\t ") );
		
		if(!fs.existsSync(config.downloadPath+matchDay)) {
			console.info(`Creating directory ${matchDay}`);
			fs.mkdirSync(config.downloadPath+matchDay);
		}

		console.info(`Unzipping ${fullPath}`);

		const file = await fsPromises.readFile(fullPath, "binary");

		JSZip.loadAsync(file).then((zip) => {
			console.info(`Zip Contents:`, Object.keys(zip.files).map(k => k));
			
			zip
			.file(Object.keys(zip.files)[0])!
			.async("nodebuffer")
			.then((file: string | NodeJS.ArrayBufferView) => {
				const newFileName = fileName?.includes(".zip") ? fileName?.replace(".zip", "") : fileName;
				fs.writeFileSync(`${config.downloadPath}/${matchDay}/${newFileName}`, file);
				fs.unlinkSync(fullPath);
				fs.writeFileSync(`${config.downloadPath}/${fileName}`, 'Original File Removed after unzipping.');
				resolve(1);
			}).catch((error) => {
				console.info(`Failed to unzip ${fileName} w/ error: ${error}`);
				resolve(0);
			});
		}).catch((error) => {
			console.info(`Failed to load ${fileName} w/ error: ${error}`);
			resolve(0);
		})

	});
}

const doesFileAlreadyExist = (filePath: string) => {
	return fs.existsSync(config.downloadPath + filePath.split("/").at(-1));
}

const downloadFiles = async (filesToProcess: any[]) => {
	
	const promisesList = filesToProcess
	.filter( file => !doesFileAlreadyExist(file.Key[0]))
	.filter( file => file.Key[0].includes(`-${args[1]}-`))
	.map((file: any) => {
		const demoUrl = file.Key[0];
		return fileDownLoadlimit( () => downloadFile(demoUrl, config.downloadPath ));
	});

	console.info( 'Files to download: ', promisesList.length );

	const results = await Promise.all( promisesList );
	logger.info(` Successful: ${results.filter( result => result === 1).length} Errors: ${results.filter( result => result === 0).length}`);

	return new Promise( (resolve, reject) => {
		resolve(results);
	});
}

const moveDemosAndStartParser = async () => {
	console.info( "Moving Demo Files to DemoScrape In directory.." );
	await copyDir(`${config.downloadPath}/${args[1]}`, `${__dirname}/demoScrape2/in`);

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

const readCSVs = async () => {
	const files = fs.readdirSync(`${__dirname}/demoScrape2/out`);
	const csvFiles = files.filter((file: any) => file.endsWith(".csv"));
	console.info(`Found ${csvFiles.length} CSV files`);
	const json = papa.parse( await fsPromises.readFile(`${__dirname}/demoScrape2/out/${csvFiles[0]}`, "utf8"), { header: true }).data;
	console.info( json.filter( (item: any) => item.steam !== '') );
}


const main = async () => {
	console.time( "execution time");

	const s3BucketResult = {
		files: [],
		numFiles: 0,
	};

	const demos: any = await promisifiedRecursiveNavigate( args ? args[0] : ``, s3BucketResult);

	fs.writeFile('C:/demofiles.txt', JSON.stringify(demos.files.map((file: any) => file.Key[0])), (err) => {
		if (err) {
			console.error(err);
		}
	});

	//const filesToDownload: any[] = demos.files.filter((file: any) => file.Key[0].includes(".zip"));

	//await downloadFiles(filesToDownload);

	//await unzipFiles();

	await moveDemosAndStartParser();

	await readCSVs();

	console.timeEnd( "execution time" );
  	console.info("Finished");

};

main();