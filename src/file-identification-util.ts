
export const demoFileIdentification = (fullPath: string) => {

    const file = fullPath.split("/").at(-1)!;
    const isCombine = file.split("-")[1]?.includes("combine");
    const isPreseason = fullPath.split("/")[1]?.includes("P");
    const isRegularSeason = fullPath.split("/")[1]?.includes("M");

    if( isCombine ){
        return {
            season: fullPath.split("/")[0],
            tier: file.split("-")[1],
            isCombine,
            isPreseason,
            matchDay: 0,
            homeTeam: "",
            awayTeam: "",
            matchId: file.split("-")[3].split("mid")[1],
            mapPlayed: file.split("-")[4],
            year: file.split("-")[5],
            month: file.split("-")[6],
            day: file.split("-")[7].split("_")[0],
        }
    }

    if(isPreseason){
        return {
            season: fullPath.split("/")[0],
            tier: "",
            isCombine,
            isPreseason,
            matchDay: 0,
            homeTeam: "",
            awayTeam: "",
            matchId: "",
            mapPlayed: file.split("_")[3]+file.split("_")[4],
            year: file.split("_")[1].split("-")[0],
            month: file.split("_")[1].split("-")[1],
            day: file.split("_")[1].split("-")[2],
        }
    }

    return {
        season: file.split("-")[0],
        tier: "",
        isCombine,
        isPreseason,
        matchDay: file.split("-")[1],
        homeTeam: file.split("-")[2],
        awayTeam: file.split("-")[4],
        matchId: file.split("-")[5]?.split("mid")[1],
        mapPlayed: file.split("-")[6],
        year: file.split("-")[7],
        month: file.split("-")[8],
        day: file.split("-")[9]?.split("_")[0],
    };
}