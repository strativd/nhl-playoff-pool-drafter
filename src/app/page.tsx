/* eslint-disable no-console */
'use client';

import * as React from 'react';
import { HiMiniTrophy } from 'react-icons/hi2';
import '@/lib/env';

import { cn } from '@/lib/utils';

import { STANDINGS_JSON } from '@/database/mock-standings';
import { MatchupData, TeamsData } from '@/database/types';

import Button from '@/components/buttons/Button';
import { useDatabase, useMatchup, useTeam } from '@/components/hooks';
import NextImage from '@/components/NextImage';

// const BASE_URL = 'https://api-web.nhle.com';

export default function HomePage() {
  const db = useDatabase();

  const loadData = async () => {
    try {
      // TODO: Fetch teams from NHL API (with tunnel)
      // const res = await fetch(`${BASE_URL}/v1/standings/now`);
      const { standings } = STANDINGS_JSON;
      await db.setAllTeams(standings);
      await db.setPlayoffMatchups();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className='bg-slate-600 p-10'>
      <div className='flex justify-between align-middle mb-6'>
        <h1 className='text-5xl text-white'>Playoff bracket</h1>
        <div className='flex gap-3'>
          {db ? (
            <Button variant='outline' onClick={async () => await db.delete()}>
              Delete DB
            </Button>
          ) : (
            <Button variant='outline' onClick={loadData}>
              Load teams
            </Button>
          )}
        </div>
      </div>
      <Bracket />
    </main>
  );
}

const Bracket: React.FC = () => {
  return (
    <div className='grid grid-cols-2 grid-rows-2'>
      <BracketDivision division='A' conference='E' />
      <BracketDivision division='C' conference='W' reverseLayout />
      <BracketDivision division='M' conference='E' />
      <BracketDivision division='P' conference='W' reverseLayout />
    </div>
  );
};

type BracketDivisionProps = {
  division: TeamsData['division'];
  conference: TeamsData['conference'];
  reverseLayout?: boolean;
};

const BracketDivision: React.FC<BracketDivisionProps> = ({
  division,
  conference,
  reverseLayout,
}) => {
  const containerClasses = cn(
    'flex gap-5 items-start min-h-72',
    reverseLayout ? 'flex-row-reverse' : 'flex-row'
  );

  return (
    <div className={containerClasses}>
      <div>
        <PlayoffMatch
          matchupId={`${division}:Div1`}
          conference={conference}
          reverseLayout={reverseLayout}
        />
        <PlayoffMatch
          matchupId={`${division}:Div2`}
          conference={conference}
          reverseLayout={reverseLayout}
        />
      </div>
      <div className='flex flex-col items-start justify-around min-h-72'>
        <PlayoffMatch
          matchupId={`${division}:DivFinals`}
          conference={conference}
          reverseLayout={reverseLayout}
        />
      </div>
    </div>
  );
};

type PlayoffMatchProps = {
  matchupId: MatchupData['matchupId'];
  conference: TeamsData['conference'];
  reverseLayout?: boolean;
};

const PlayoffMatch: React.FC<PlayoffMatchProps> = ({
  matchupId,
  reverseLayout,
}) => {
  const { matchup, setWinner } = useMatchup(matchupId);

  const containerClasses = cn(
    'flex gap-3 items-start',
    reverseLayout ? 'flex-row-reverse' : 'flex-row'
  );

  return (
    <div className={containerClasses}>
      <div className='flex flex-col gap-3 items-start min-h-36'>
        <TeamButton
          teamId={matchup?.homeTeamId}
          onClick={matchup ? (team) => setWinner(team.id) : undefined}
          disabled={!matchup?.homeTeamId || !matchup?.awayTeamId}
        />
        <TeamButton
          teamId={matchup?.awayTeamId}
          onClick={matchup ? (team) => setWinner(team.id) : undefined}
          disabled={!matchup?.homeTeamId || !matchup?.awayTeamId}
        />
      </div>
      <div className='flex flex-col justify-around items-start min-h-32'>
        <TeamButton teamId={matchup?.winnerTeamId} disabled={true} />
      </div>
    </div>
  );
};

type TeamButtonProps = {
  teamId?: string;
  disabled?: boolean;
  onClick?: (team: TeamsData) => void;
};

const TeamButton: React.FC<TeamButtonProps> = ({
  teamId,
  disabled,
  onClick,
}) => {
  const team = useTeam(teamId);

  return team ? (
    <Button
      onClick={() => onClick?.(team)}
      className='min-h-14 min-w-20 flex justify-center align-middle'
      disabled={disabled}
    >
      <NextImage
        className='w-auto h-auto'
        height={50}
        width={50}
        src={team.logo}
        alt={team.name}
      />
    </Button>
  ) : (
    <Button
      className='min-h-14 min-w-20 flex justify-center align-middle'
      variant='outline'
    >
      <HiMiniTrophy size={30} color='white' />
    </Button>
  );
};
