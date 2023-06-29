import axios from "axios";
import xml2js from "xml2js"
import fs from "fs";


const config = {
    url: `https://cscdemos.nyc3.digitaloceanspaces.com/`,
    downloadPath: "C:/demofiles/",
}


const recuriveNavigate = async (directory: any, result: any) => {
    const url = directory ? `${config.url}?delimiter=/&prefix=${directory}` : `${config.url}`;
    const { data } = await axios.get(url, { headers: { "Content-Type": "application/xml" } });
  
    const jsonizedResponse = await xml2js.parseStringPromise(data);
    const discoveredDirectories = jsonizedResponse.ListBucketResult.CommonPrefixes?.map((item: any) => item.Prefix[0]) ?? [];
    console.info(directory, " => ", discoveredDirectories);
    const files = jsonizedResponse.ListBucketResult.Contents?.map((item: any) => item) ?? [];
  
    if (files.length > 0) {
      result.files.push(...files);
      result.numFiles += files.length;
    }
  
    const promises = discoveredDirectories.map((directory: any) => recuriveNavigate(directory, result));
    await Promise.all(promises);
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
    try {
      const response = await axios.get(config.url+demoUrl, { responseType: 'stream', headers: { "accept-encoding": "gzip, deflate, br" } });
      const writer = fs.createWriteStream(destinationPath+`${demoUrl.split("/").at(-1)}`);
  
      response.data.pipe(writer);
  
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error: any) {
      throw new Error(`File download failed: ${error.message}`);
    }
  };


const main = async () => {

  const result = {
    files: [],
    numFiles: 0,
  };
  
  const demos: any = await promisifiedRecursiveNavigate('', result);
  console.info( demos.files );

  demos.files.filter( (file: any) => file.Key[0].includes(".zip")).forEach( (file: any) => {
    const demoUrl = file.Key[0];
    console.info(`Downloading... ${demoUrl}`)
    downloadFile( demoUrl, config.downloadPath);
  })

  console.info("Finished");

};

main();