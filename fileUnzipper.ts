import pLimit from "p-limit";
import fs, { promises as fsPromises } from "fs";
import { demoFileIdentification } from "./file-identification-util.ts";
import JSZip, { file } from "jszip";
import { config } from "./config.ts";

const unZipLimit = pLimit(16);

const keepCompleteFiles = async ( filePaths: string[]) => {
	const newFilePaths = [...filePaths];
	for await ( const [index, zipFile] of filePaths.entries()){
			if(fs.statSync(config.downloadPath + zipFile).size < 10 * 1024 * 1024){
				delete newFilePaths[index]
				console.info(`Removing ${zipFile} - file size to small to be full demo.`)
				fs.unlinkSync(config.downloadPath + zipFile);
			}
	}

	return newFilePaths;
}

export const unzipFiles = async () => {
	const files = fs.readdirSync(config.downloadPath);
	const zipFiles = await keepCompleteFiles(files.filter((file: any) => file.endsWith(".zip")));

	let progressCounter = 0;
	return zipFiles.map( async (file: any, index: number) => {
		return await unZipLimit(() => unzipFile(config.downloadPath + file))
			.then( () => { 
				progressCounter++; 
				console.info(`${progressCounter}/ ${zipFiles.length}`)
			});
	});
}

export const unzipFile = async (filePath: string) => {
	return new Promise(async (resolve, reject) => {
		const fullPath = filePath;
		const folderPathArray = filePath.split("/");
		const fileName = folderPathArray.at(-1);
		const matchDay = folderPathArray.at(-1)?.split("-")[1]!;
		const deets = demoFileIdentification(fileName!);

		//console.info(Object.values(deets).join("\t "));

		if (!fs.existsSync(config.downloadPath + "/unzipped")) {
			console.info(`Creating directory /unzipped`);
			fs.mkdirSync(config.downloadPath + "/unzipped");
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
					fs.writeFileSync(`${config.downloadPath}/unzipped/${newFileName}`, file);
					fs.unlinkSync(fullPath);
					//fs.writeFileSync(`${config.downloadPath}/${fileName}`, 'Original File Removed after unzipping.');
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

//unzipFiles();