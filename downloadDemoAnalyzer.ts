
import { downloadRelease } from '@terascope/fetch-github-release'
import { config } from "./config.ts";

const leaveZipped = false;
const disableLogging = false;

// Define a function to filter releases.
function filterRelease(release: { prerelease: boolean; }) {
  // Filter out prereleases.
  return release.prerelease === false;
}

// Define a function to filter assets.
function filterAsset(asset: { name: string | string[]; }) {
    const platform = process.platform;
    if (platform === 'win32') {
        return asset.name.includes('windows');
    } else if (platform === 'linux') {
        return asset.name.includes('linux');
    } else {
        throw new Error(`Platform ${platform} not supported.`);
    }
}

export const downloadDemoAnalyzerCLI = async () => downloadRelease(
    config.demoAnalyzerDownloadConfig.user, 
    config.demoAnalyzerDownloadConfig.repo, 
    config.demoAnalyzerPath, 
    filterRelease, 
    filterAsset, 
    leaveZipped, 
    disableLogging
)
  .then( result => {
    console.log('All done!, result: ', result);
  })
  .catch(function(err) {
    console.error(err.message);
  });

//downloadDemoAnalyzerCLI();


  