/* eslint-disable no-console */
'use client';

import { clsx } from 'clsx';
import { useLiveQuery } from 'dexie-react-hooks';
import * as React from 'react';
import { HiMiniTrophy } from 'react-icons/hi2';
import '@/lib/env';

import { DrafterDb, TeamsData } from '@/database';
import { MOCK_STANDINGS } from '@/database/mock-standings';

import Button from '@/components/buttons/Button';

const db = new DrafterDb();

const { teams } = db;

// const BASE_URL = 'https://api-web.nhle.com';

export default function HomePage() {
  const playoffTeams = useLiveQuery(
    () => teams.filter((team) => !!team.bracketCode).toArray(),
    []
  );

  const handleClick = async () => {
    try {
      // TODO: Fetch teams from NHL API (with tunnel)
      // const res = await fetch(`${BASE_URL}/v1/standings/now`);
      const { standings } = MOCK_STANDINGS;
      await db.setAllTeams(standings);
      await db.setPlayoffTeams();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className='bg-slate-600 p-10'>
      <h1 className='text-5xl text-center text-white'>Playoff bracket</h1>
      <Bracket playoffTeams={playoffTeams} />
      <div>
        <Button onClick={handleClick}>Load teams</Button>
      </div>
    </main>
  );
}

type BracketProps = {
  playoffTeams?: TeamsData[];
};

type TeamsByBracketCodeMap = Record<string, TeamsData>;

const Bracket: React.FC<BracketProps> = ({ playoffTeams }) => {
  const teamsByBracketCode: TeamsByBracketCodeMap = React.useMemo(() => {
    const teamsMap: TeamsByBracketCodeMap = {};
    playoffTeams?.map((team) => {
      if (!team.bracketCode.length) return;
      teamsMap[team.bracketCode] = team;
    });
    return teamsMap;
  }, [playoffTeams]);

  return (
    <div className='grid grid-cols-2 grid-rows-2'>
      <BracketDivision
        divisionName='Atlantic'
        teamsOrdered={
          [
            teamsByBracketCode['A1'],
            teamsByBracketCode['A2'],
            teamsByBracketCode['A3'],
            teamsByBracketCode['A4'],
          ].filter(Boolean) as TeamsData[]
        }
      />
      <BracketDivision
        divisionName='Central'
        reverseLayout
        teamsOrdered={
          [
            teamsByBracketCode['C1'],
            teamsByBracketCode['C2'],
            teamsByBracketCode['C3'],
            teamsByBracketCode['C4'],
          ].filter(Boolean) as TeamsData[]
        }
      />
      <BracketDivision
        divisionName='Metro'
        teamsOrdered={
          [
            teamsByBracketCode['M1'],
            teamsByBracketCode['M2'],
            teamsByBracketCode['M3'],
            teamsByBracketCode['M4'],
          ].filter(Boolean) as TeamsData[]
        }
      />
      <BracketDivision
        divisionName='Pacific'
        reverseLayout
        teamsOrdered={
          [
            teamsByBracketCode['P1'],
            teamsByBracketCode['P2'],
            teamsByBracketCode['P3'],
            teamsByBracketCode['P4'],
          ].filter(Boolean) as TeamsData[]
        }
      />
    </div>
  );
};

type BracketDivisionProps = {
  divisionName?: string;
  reverseLayout?: boolean;
  teamsOrdered: TeamsData[];
};

const BracketDivision: React.FC<BracketDivisionProps> = ({
  teamsOrdered,
  reverseLayout,
}) => {
  const [winnerR1A, setWinnerR1A] = React.useState<TeamsData | undefined>();
  const [winnerR1B, setWinnerR1B] = React.useState<TeamsData | undefined>();
  const [winnerR2, setWinnerR2] = React.useState<TeamsData | undefined>();

  const containerClasses = clsx(
    'flex gap-5 items-start min-h-72',
    reverseLayout ? 'flex-row-reverse' : 'flex-row'
  );

  return (
    <div className={containerClasses}>
      <div>
        <PlayoffMatch
          homeTeam={teamsOrdered[0]}
          awayTeam={teamsOrdered[3]}
          reverseLayout={reverseLayout}
          winner={winnerR1A}
          setWinner={setWinnerR1A}
        />
        <PlayoffMatch
          homeTeam={teamsOrdered[1]}
          awayTeam={teamsOrdered[2]}
          reverseLayout={reverseLayout}
          winner={winnerR1B}
          setWinner={setWinnerR1B}
        />
      </div>
      <div className='flex flex-col items-start justify-around min-h-72'>
        <PlayoffMatch
          homeTeam={winnerR1A}
          awayTeam={winnerR1B}
          reverseLayout={reverseLayout}
          winner={winnerR2}
          setWinner={setWinnerR2}
        />
      </div>
    </div>
  );
};

type PlayoffMatchProps = {
  homeTeam?: TeamsData;
  awayTeam?: TeamsData;
  reverseLayout?: boolean;
  winner?: TeamsData;
  setWinner: (team: TeamsData) => void;
};

const PlayoffMatch: React.FC<PlayoffMatchProps> = ({
  homeTeam,
  awayTeam,
  reverseLayout,
  winner,
  setWinner,
}) => {
  const containerClasses = clsx(
    'flex gap-3 items-start',
    reverseLayout ? 'flex-row-reverse' : 'flex-row'
  );

  return (
    <div className={containerClasses}>
      <div className='flex flex-col gap-3 items-start min-h-36'>
        <TeamButton team={homeTeam} onClick={setWinner} />
        <TeamButton team={awayTeam} onClick={setWinner} />
      </div>
      <div className='flex flex-col justify-around items-start min-h-32'>
        <TeamButton team={winner} onClick={setWinner} />
      </div>
    </div>
  );
};

type TeamButtonProps = {
  team?: TeamsData;
  onClick: (team: TeamsData) => void;
};

const TeamButton: React.FC<TeamButtonProps> = ({ team, onClick }) => {
  return team ? (
    <Button
      onClick={() => onClick(team)}
      className='min-h-14 min-w-20 flex justify-center align-middle'
    >
      {/* <Image height={50} width={50} src={team.logo} alt={team.name} /> */}
      {team.abbr}
    </Button>
  ) : (
    <Button className='min-h-14 min-w-20 flex justify-center align-middle'>
      <HiMiniTrophy size={30} color='white' />
    </Button>
  );
};
