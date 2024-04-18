/**
 * https://github.com/Zmalski/NHL-API-Reference?tab=readme-ov-file
 *
 * https://api-web.nhle.com/v1/standings/now
 */
import JSON from '@/database/mock-standings.json';
import { TeamStandingsResponse } from '@/database/types';

export const STANDINGS_JSON = JSON as TeamStandingsResponse;
