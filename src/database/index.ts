import Dexie from 'dexie';

import { TeamStanding } from '@/database/types';

export class DrafterDb extends Dexie {
  teams!: Dexie.Table<TeamsData, number>;
  players!: Dexie.Table<PlayersData, number>;

  constructor() {
    super('DrafterDb');

    this.version(1).stores({
      teams:
        '++id,name,abbr,division,conference,rankInConf,rankInDiv,rankInWild,points,eliminated,logo,bracketCode,expectedGames', // TODO: Add players
      players:
        '++id,team,watching,drafted,name,position,goals,assists,points,powerPlayPoints,powerPlayUnit,shortHandedPoints,gamesPlayed,totalSecondsOnIce,averageSecondsOnIce',
    });
  }

  setAllTeams = async (standings: TeamStanding[]) => {
    const teams: TeamsData[] = [];
    standings.forEach((standing) => {
      const team: TeamsData = {
        abbr: standing.teamAbbrev.default,
        conference: standing.conferenceAbbrev,
        division: standing.divisionAbbrev,
        eliminated: !standing.clinchIndicator,
        logo: standing.teamLogo,
        name: standing.teamName.default,
        points: standing.points,
        rankInConf: standing.conferenceSequence,
        rankInDiv: standing.divisionSequence,
        rankInWild: standing.wildcardSequence,
        bracketCode: '',
        expectedGames: 6,
      };
      teams.push(team);
    });
    await this.teams.clear();
    await this.teams.bulkAdd(teams);
  };

  setPlayoffTeams = async () => {
    const topPerDiv: TeamsData[] = [];
    // get the top three teams from each division
    const top12 = await this.teams
      .filter((team) => team.rankInDiv < 4)
      .toArray();
    // assign top teams a bracket code (Ex: A1, A2, M1, M2)
    top12.forEach((team) => {
      // also get top teams per div for later
      if (team.rankInDiv === 1) {
        topPerDiv.push(team);
      }
      const bracketCode = team.division + team.rankInDiv;
      this.teams.update(team, { bracketCode });
    });
    // get top two wildcard teams from each conference
    const [eastWildOne, eastWildTwo] = await this.teams
      .filter(
        (team) =>
          team.conference === 'E' && team.rankInWild > 0 && team.rankInWild < 3
      )
      .sortBy('rankInWild');
    const [westWildOne, westWildTwo] = await this.teams
      .filter(
        (team) =>
          team.conference === 'W' && team.rankInWild > 0 && team.rankInWild < 3
      )
      .sortBy('rankInWild');
    // and get the top two teams from each conference
    const [eastOne, eastTwo] = topPerDiv
      .filter((team) => team.conference === 'E')
      .toSorted((aTeam, bTeam) => bTeam.rankInConf - aTeam.rankInConf);
    const [westOne, westTwo] = topPerDiv
      .filter((team) => team.conference === 'W')
      .toSorted((aTeam, bTeam) => bTeam.rankInConf - aTeam.rankInConf);
    // Now we can assign wildcards the 4th spot in the right division
    await this.teams.update(eastWildTwo, {
      bracketCode: eastOne.division + '4',
    });
    await this.teams.update(eastWildOne, {
      bracketCode: eastTwo.division + '4',
    });
    await this.teams.update(westWildTwo, {
      bracketCode: westOne.division + '4',
    });
    await this.teams.update(westWildOne, {
      bracketCode: westTwo.division + '4',
    });
  };
}

export type TeamsData = {
  id?: number;
  name: string;
  abbr: string;
  division: 'A' | 'C' | 'M' | 'P';
  conference: 'E' | 'W';
  rankInConf: number;
  rankInDiv: number;
  rankInWild: number;
  points: number;
  eliminated: boolean;
  logo: string;
  bracketCode: string;
  expectedGames: number;
  // players: number[];
};

export type PlayersData = {
  id?: number;
  team: string;
  teamId: number;
  watching: boolean;
  drafted: boolean;
  name: string;
  position: 'C' | 'LW' | 'RW' | 'D';
  goals: number;
  assists: number;
  points: number;
  powerPlayPoints: number;
  powerPlayUnit?: 1 | 2;
  shortHandedPoints: number;
  gamesPlayed: number;
  totalSecondsOnIce: number;
  averageSecondsOnIce: number;
};
