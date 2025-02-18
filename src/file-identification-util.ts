
export const demoFileIdentification = (fileName: string, seasonFallback?: string) => {

    const fileNameArray = fileName.split("-") 
    const isCombine = fileName.includes("combine");
    const isPreseason = false; //fileName.split("/")[1]?.includes("P");
    const isRegulation = isCombine ? false : true;
    const isPlayoff = fileName.split("/")[1]?.includes("P");

    if( isCombine ){
        //combine-challenger-mid4204-0_de_ancient-2025-01-05_02-11-09.dem.zip
        return {
            season: seasonFallback,
            tier: fileNameArray[1],
            isCombine,
            isPreseason,
            isRegulation,
            matchDay: 0,
            homeTeam: "",
            awayTeam: "",
            matchId: fileNameArray[2].replace("mid", ""),
            mapPlayed: fileNameArray[3].split("_").at(-1),
            year: fileNameArray[4],
            month: fileNameArray[5],
            day: fileNameArray[6].split("_")[0],
        }
    }

    if(isPreseason){
        return {
            season: 0,
            tier: "",
            isCombine,
            isPreseason,
            isRegulation,
            matchDay: 0,
            homeTeam: "",
            awayTeam: "",
            matchId: "",
            mapPlayed: fileName.split("_")[3]+fileName.split("_")[4],
            year: fileName.split("_")[1].split("-")[0],
            month: fileName.split("_")[1].split("-")[1],
            day: fileName.split("_")[1].split("-")[2],
        }
    }

    // 	s16-M01-Argonauts-vs-Drakes-mid5347-0_de_mirage-2025-02-12_03-15-05.dem.zip
    return {
        season: fileNameArray[0].replace("s", ""),
        tier: "",
        isCombine,
        isPreseason,
        isRegulation,
        matchDay: fileNameArray[1],
        homeTeam: fileNameArray[2],
        awayTeam: fileNameArray[4],
        matchId: fileNameArray[5]?.replace("mid", ""),
        mapPlayed: fileNameArray[6].split("_").at(-1),
        year: fileNameArray[7],
        month: fileNameArray[8],
        day: fileNameArray[9]?.split("_")[0],
    };
}