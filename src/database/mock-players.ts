/**
 * https://github.com/Zmalski/NHL-API-Reference?tab=readme-ov-file
 *
 * https://api.nhle.com/stats/rest/en/skater/summary?limit=-1&sort=points&cayenneExp=seasonId=20232024
 */
import JSON from '@/database/mock-players.json';
import { PlayerSummaryResponse } from '@/database/types';

export const PLAYERS_JSON = JSON as PlayerSummaryResponse;
