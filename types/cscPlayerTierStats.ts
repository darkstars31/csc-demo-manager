export type CscStatsQuery = {
	data: {
		tierSeasonStats: CscStats[];
	};
};

export interface CscStats {
	adp: number;
	adr: number;
	assists: number;
	awpR: number;
	cl_1: number;
	cl_2: number;
	cl_3: number;
	cl_4: number;
	cl_5: number;
	clutchR: number;
	consistency: number;
	ctRating: number;
	deaths: number;
	ef: number;
	fAssists: number;
	fiveK: number;
	form: number;
	fourK: number;
	gameCount: number;
	hs: number;
	impact: number;
	kast: number;
	kills: number;
	kr: number;
	multiR: number;
	name: string;
	odaR: number;
	odr: number;
	peak: number;
	pit: number;
	rating: number;
	rounds: number;
	saveRate: number;
	savesR: number;
	sRate: number;
	suppR: number;
	suppXR: number;
	team: string;
	threeK: number;
	tradesR: number;
	TRating: number;
	tRatio: number;
	twoK: number;
	util: number;
	utilDmg: number;
	//[key: string]: any;
	__typename: string;
}
