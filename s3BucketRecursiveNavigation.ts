import axios from "axios";
import xml2js from "xml2js"
import { config } from "./config.ts";
import pLimit from "p-limit";

const directoryTraversalLimit = pLimit(1);

export const recuriveNavigate = async (directory: any, result: any) => {
	const url = `${config.url}?delimiter=/&prefix=${directory}`;
	const { data } = await axios.get(url, { headers: { "Content-Type": "application/xml" } });

	const jsonizedResponse = await xml2js.parseStringPromise(data);
	const discoveredDirectories = jsonizedResponse.ListBucketResult.CommonPrefixes?.map((item: any) => item.Prefix[0]) ?? [];
	console.info(directory, " => ", discoveredDirectories);
	const files = jsonizedResponse.ListBucketResult.Contents?.map((item: any) => item) ?? [];

	if (files.length > 0) {
		result.files.push(...files);
		result.numFiles += files.length;
	}

	// Avoid pre-match Scrims
	const directoriesToSiftThrough = discoveredDirectories?.filter((directory: any) => {
		return !directory.includes("Scrims")
	}) ?? [];

	const promises = directoriesToSiftThrough.map((directory: any) => recuriveNavigate(directory, result));
	await Promise.all(promises)
	Promise.resolve(result);
};

export const promisifiedRecursiveNavigate = (directory: any, result: any) => {
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