/**
 * Player summary response type
 */
export interface PlayerSummaryResponse {
  data: PlayerSummary[];
  total: number;
}

export interface PlayerSummary {
  assists: number;
  evGoals: number;
  evPoints: number;
  faceoffWinPct: number | null;
  gameWinningGoals: number;
  gamesPlayed: number;
  goals: number;
  lastName: string;
  otGoals: number;
  penaltyMinutes: number;
  playerId: number;
  plusMinus: number;
  points: number;
  pointsPerGame: number;
  positionCode: string;
  ppGoals: number;
  ppPoints: number;
  seasonId: number;
  shGoals: number;
  shPoints: number;
  shootingPct: number | null;
  shootsCatches: string;
  shots: number;
  skaterFullName: string;
  teamAbbrevs: string;
  timeOnIcePerGame: number;
}

/**
 * NHL Standings response type
 */
export interface TeamStandingsResponse {
  wildCardIndicator: boolean;
  standings: TeamStanding[];
}

export interface TeamStanding {
  clinchIndicator?: string;
  conferenceAbbrev: 'E' | 'W';
  conferenceHomeSequence: number;
  conferenceL10Sequence: number;
  conferenceName: string;
  conferenceRoadSequence: number;
  conferenceSequence: number;
  date: string;
  divisionAbbrev: 'A' | 'C' | 'M' | 'P';
  divisionHomeSequence: number;
  divisionL10Sequence: number;
  divisionName: string;
  divisionRoadSequence: number;
  divisionSequence: number;
  gameTypeId: number;
  gamesPlayed: number;
  goalDifferential: number;
  goalDifferentialPctg: number;
  goalAgainst: number;
  goalFor: number;
  goalsForPctg: number;
  homeGamesPlayed: number;
  homeGoalDifferential: number;
  homeGoalsAgainst: number;
  homeGoalsFor: number;
  homeLosses: number;
  homeOtLosses: number;
  homePoints: number;
  homeRegulationPlusOtWins: number;
  homeRegulationWins: number;
  homeTies: number;
  homeWins: number;
  l10GamesPlayed: number;
  l10GoalDifferential: number;
  l10GoalsAgainst: number;
  l10GoalsFor: number;
  l10Losses: number;
  l10OtLosses: number;
  l10Points: number;
  l10RegulationPlusOtWins: number;
  l10RegulationWins: number;
  l10Ties: number;
  l10Wins: number;
  leagueHomeSequence: number;
  leagueL10Sequence: number;
  leagueRoadSequence: number;
  leagueSequence: number;
  losses: number;
  otLosses: number;
  placeName: PlaceName;
  pointPctg: number;
  points: number;
  regulationPlusOtWinPctg: number;
  regulationPlusOtWins: number;
  regulationWinPctg: number;
  regulationWins: number;
  roadGamesPlayed: number;
  roadGoalDifferential: number;
  roadGoalsAgainst: number;
  roadGoalsFor: number;
  roadLosses: number;
  roadOtLosses: number;
  roadPoints: number;
  roadRegulationPlusOtWins: number;
  roadRegulationWins: number;
  roadTies: number;
  roadWins: number;
  seasonId: number;
  shootoutLosses: number;
  shootoutWins: number;
  streakCode: string;
  streakCount: number;
  teamName: TeamName;
  teamCommonName: PlaceName;
  teamAbbrev: TeamAbbrev;
  teamLogo: string;
  ties: number;
  waiversSequence: number;
  wildcardSequence: number;
  winPctg: number;
  wins: number;
}

interface TeamAbbrev {
  default: string;
}

interface TeamName {
  default: string;
  fr: string;
}

interface PlaceName {
  default: string;
  fr?: string;
}
