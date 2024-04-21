import Dexie from 'dexie';

import { PLAYERS_JSON } from '@/database/mock-players';
import { STANDINGS_JSON } from '@/database/mock-standings';
import { MatchupData, PlayersData, TeamsData } from '@/database/types';

// const BASE_URL = 'https://api-web.nhle.com';

export class DrafterDb extends Dexie {
  teams!: Dexie.Table<TeamsData, number>;
  matchups!: Dexie.Table<MatchupData, number>;
  players!: Dexie.Table<PlayersData, number>;

  constructor() {
    super('DrafterDb');

    this.version(1).stores({
      teams:
        'id,name,abbr,division,conference,rankInConf,rankInDiv,rankInWild,points,eliminated,logo,bracketCode,seriesPlayed',
      matchups:
        '++id,division,conference,matchupId,homeTeamId,awayTeamId,winnerTeamId',
      players:
        '++id,team,teamId,watching,drafted,name,position,goals,assists,points,powerPlayPoints,powerPlayUnit,shortHandedPoints,gamesPlayed,totalSecondsOnIce,averageSecondsOnIce,expectedPoints,pointsPerGame',
    });
  }

  setAllPlayers = async () => {
    const data = PLAYERS_JSON.data;
    const players: PlayersData[] = [];
    data.forEach(async (p) => {
      const player: Omit<PlayersData, 'team' | 'teamId' | 'expectedPoints'> = {
        watching: false,
        drafted: false,
        name: p.skaterFullName,
        position: p.positionCode,
        goals: p.goals,
        assists: p.assists,
        points: p.points,
        powerPlayPoints: p.ppPoints,
        shortHandedPoints: p.shPoints,
        gamesPlayed: p.gamesPlayed,
        totalSecondsOnIce: p.timeOnIcePerGame * p.gamesPlayed,
        averageSecondsOnIce: p.timeOnIcePerGame,
        pointsPerGame: +(p.points / p.gamesPlayed).toFixed(2),
      };
      // add team data
      const teams = p.teamAbbrevs.split(',');
      const teamId = teams[teams.length - 1];
      const team = await this.teams.get({ id: teamId });
      if (!team)
        throw new Error(`Team ${teamId} not found for ${p.skaterFullName}`);
      if (team.eliminated) return;
      const playoffPlayer = player as PlayersData;
      playoffPlayer.team = team;
      playoffPlayer.teamId = teamId;
      // add expected stats
      const seriesWins = playoffPlayer.team.seriesPlayed;
      const expectedGames = seriesWins * 6;
      const pointsPerGame = playoffPlayer.pointsPerGame;
      const expectedPoints = pointsPerGame * expectedGames;
      playoffPlayer.expectedPoints = +expectedPoints.toFixed(2);
      players.push(playoffPlayer);
    });
    await this.players.clear();
    await this.players.bulkAdd(players);
  };

  setAllTeams = async () => {
    const standings = STANDINGS_JSON.standings;
    // const res = await fetch(`${BASE_URL}/v1/standings/now`);
    const teams: TeamsData[] = [];
    standings.forEach((standing) => {
      const team: TeamsData = {
        id: standing.teamAbbrev.default,
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
        seriesPlayed: 1,
      };
      teams.push(team);
    });
    await this.teams.clear();
    await this.teams.bulkAdd(teams);
  };

  setPlayoffMatchups = async () => {
    // get top 3 teams from each division
    const atlanticTeams = await this.teams
      .filter((team) => team.division === 'A' && team.rankInDiv < 4)
      .sortBy('rankInDiv');
    const centralTeams = await this.teams
      .filter((team) => team.division === 'C' && team.rankInDiv < 4)
      .sortBy('rankInDiv');
    const metroTeams = await this.teams
      .filter((team) => team.division === 'M' && team.rankInDiv < 4)
      .sortBy('rankInDiv');
    const pacificTeams = await this.teams
      .filter((team) => team.division === 'P' && team.rankInDiv < 4)
      .sortBy('rankInDiv');
    // get top two wildcard teams from eastern conference
    const [eastWildOne, eastWildTwo] = await this.teams
      .filter(
        (team) =>
          team.conference === 'E' && team.rankInWild > 0 && team.rankInWild < 3,
      )
      .sortBy('rankInWild');
    // and assign eastern conference wildcards to the right divisions
    if (atlanticTeams[0].rankInConf > metroTeams[0].rankInConf) {
      atlanticTeams.push(eastWildOne);
      metroTeams.push(eastWildTwo);
    } else {
      atlanticTeams.push(eastWildTwo);
      metroTeams.push(eastWildOne);
    }
    // get top two wildcard teams from western conference
    const [westWildOne, westWildTwo] = await this.teams
      .filter(
        (team) =>
          team.conference === 'W' && team.rankInWild > 0 && team.rankInWild < 3,
      )
      .sortBy('rankInWild');
    // and assign western conference wildcards to the right divisions
    if (centralTeams[0].rankInConf > pacificTeams[0].rankInConf) {
      centralTeams.push(westWildOne);
      pacificTeams.push(westWildTwo);
    } else {
      centralTeams.push(westWildTwo);
      pacificTeams.push(westWildOne);
    }
    // create matchups within each division
    const matchups: MatchupData[] = [];
    [atlanticTeams, centralTeams, metroTeams, pacificTeams].forEach(
      ([t1, t2, t3, t4]) => {
        const division = t1.division;
        const conference = t1.conference;
        matchups.push({
          matchupId: `${division}:Div1`,
          nextMatchupId: `${division}:DivFinals`,
          division,
          conference,
          homeTeamId: t1.id,
          awayTeamId: t4.id,
        });
        matchups.push({
          matchupId: `${division}:Div2`,
          nextMatchupId: `${division}:DivFinals`,
          division,
          conference,
          homeTeamId: t2.id,
          awayTeamId: t3.id,
        });
        matchups.push({
          matchupId: `${division}:DivFinals`,
          division,
          conference,
        });
      },
    );
    // create matchups
    await this.matchups.clear();
    await this.matchups.bulkAdd(matchups);
  };

  setMatchupWinner = async (matchup: MatchupData, winnerTeamId: string) => {
    // update DivFinals matchup with winner as well
    if (matchup.nextMatchupId) {
      const nextMatchup = await this.matchups.get({
        matchupId: matchup.nextMatchupId,
      });
      if (!nextMatchup)
        throw new Error(`Next matchup ${matchup.nextMatchupId} not found`);
      if (matchup.matchupId.includes('Div1')) {
        await this.matchups.update(nextMatchup, { homeTeamId: winnerTeamId });
      } else {
        await this.matchups.update(nextMatchup, { awayTeamId: winnerTeamId });
      }
      await this.matchups.update(nextMatchup, { winnerTeamId: undefined });
    }
    await this.matchups.update(matchup, { winnerTeamId });
    await this.setMatchupWinnerSeriesPlayed(matchup, winnerTeamId);
  };

  // set winning team's series played based on the matchup that was won
  setMatchupWinnerSeriesPlayed = async (
    matchup: MatchupData,
    winnerTeamId: string,
  ) => {
    const winningTeam = await this.teams.get({ id: winnerTeamId });
    if (!winningTeam) throw new Error(`Winning team ${winnerTeamId} not found`);
    const loserTeamId =
      winnerTeamId === matchup.homeTeamId
        ? matchup.awayTeamId
        : matchup.homeTeamId;
    if (!loserTeamId) throw new Error(`Loser team ${winnerTeamId} not found`);
    const loserTeam = await this.teams.get({ id: loserTeamId });
    if (!loserTeam) throw new Error(`Loser team ${winnerTeamId} not found`);

    const seriesPlayed = matchup.nextMatchupId ? 2 : 3;
    const seriesPlayedForLoser = seriesPlayed - 1;
    await this.teams.update(winningTeam, { seriesPlayed });
    await this.teams.update(loserTeam, { seriesPlayed: seriesPlayedForLoser });
    await this.setPlayerExpectedPoints(matchup);
  };

  // set the expected points for the winning and loser teams
  setPlayerExpectedPoints = async (matchup: MatchupData) => {
    const players = await this.players
      .filter(
        (player) =>
          player.teamId === matchup.homeTeamId ||
          player.teamId === matchup.awayTeamId,
      )
      .toArray();

    const homeTeam = await this.teams.get({ id: matchup.homeTeamId });
    const awayTeam = await this.teams.get({ id: matchup.awayTeamId });
    if (!homeTeam || !awayTeam)
      throw new Error('Home or away team not found for matchup');

    const expectedPoints = players.map((player) => {
      const playersTeamId = player.teamId;
      const playersTeam = playersTeamId === homeTeam.id ? homeTeam : awayTeam;
      const seriesPlayed = playersTeam.seriesPlayed;
      const expectedGames = seriesPlayed * 6;
      const pointsPerGame = player.pointsPerGame;
      return +(pointsPerGame * expectedGames).toFixed(2);
    });

    await this.players.bulkPut(
      players.map((player, i) => {
        return {
          ...player,
          expectedPoints: expectedPoints[i],
        };
      }),
    );
  };
}
