import { CscStatsQuery } from "../types/cscPlayerTierStats";

const analytikillUrl = 'https://tonysanti.com/prx/csc-stat-api';
const cachedUrl = '/csc/cached-tier-season-stats'

export type CscTiers = "Recruit" | "Prospect" | "Contender" | "Challenger" | "Elite" | "Premier"

export const fetchCachedCscPlayerStats = async (tier: CscTiers, season?: number, matchType?: string) =>
	await fetch(`${analytikillUrl}${cachedUrl}?season=${season}&tier=${tier}&matchType=${matchType}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	})
    .then(async response => response.json().then((json: CscStatsQuery) => json.data?.tierSeasonStats))