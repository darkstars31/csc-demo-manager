import pLimit from "p-limit";
import fs, { promises as fsPromises } from "fs";
import { demoFileIdentification } from "./file-identification-util.ts";
import _7z from "7zip-min"; 
import { config } from "../config.ts";
import { progress } from "./progressUtils.ts";

const unZipLimit = pLimit(6);

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
	const errors: string[] = [];
	const files = fs.readdirSync(config.downloadPath);
	const zipFiles = await keepCompleteFiles(files.filter((file: any) => file.endsWith(".zip")));
	const failures: any[] = [];
	let progressCounter = 0;
	const zipPromises = zipFiles.map( async (file: any, index: number) => {
		return await unZipLimit(() => unzipFile(config.downloadPath + file))
			.then( () => { 
				progressCounter++;
				progress('File Unzip progress', progressCounter, zipFiles.length);
			})
			.catch( (err: any) => {
				errors.push(err.message);
				failures.push(file);
			});
	});
	const results = await Promise.allSettled(zipPromises);
	if( failures.length > 0 ) {
		console.info(`File Unzip failures:`, failures, errors);
	}

	return results;
}

export const unzipFile = async (filePath: string) => {
	return new Promise((resolve, reject) => {
		const fullPath = filePath;
		const folderPathArray = filePath.split("/");
		const fileName = folderPathArray.at(-1);
		const matchDay = folderPathArray.at(-1)?.split("-")[1]!;
		const deets = demoFileIdentification(fileName!);

		if (!fs.existsSync(config.downloadPath + "/unzipped")) {
			console.info(`Creating directory /unzipped`);
			fs.mkdirSync(config.downloadPath + "/unzipped");
		}

		try {
			console.info(`Unzipping ${fullPath.split("/").at(-1)}`);
		} catch (error) {
			console.info(`Error: ${error}`);
		}

		_7z.unpack(fullPath, `${config.downloadPath}/unzipped/`, err => {
			if (err) {
				console.info(`Failed to unpack ${fileName} w/ error: ${err}`);
				reject(0);
			}
			const basePath = `${config.downloadPath}/unzipped`;
			const newFileName = fileName?.replace(".zip", "")
			if( fs.existsSync(`${basePath}/demos/${newFileName}`)) {
				fs.rename(`${basePath}/demos/${newFileName}`, `${basePath}/${newFileName}`, (err) => {
					if (err) console.warn(`Error moving file /demos/${newFileName} : `, err);
				});
			}
			fs.unlinkSync(fullPath);
			resolve(`${basePath}/${newFileName}`);
		})
	})

}

//unzipFiles();