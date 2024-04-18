import { cn } from '@/lib/utils';

import { MatchupData, TeamsData } from '@/database';

import { useMatchup } from '@/components/hooks';

import { TeamButton } from '@/app/bracket/components/TeamButton';

type PlayoffMatchProps = {
  matchupId: MatchupData['matchupId'];
  conference: TeamsData['conference'];
  reverseLayout?: boolean;
};

export const PlayoffMatch: React.FC<PlayoffMatchProps> = ({
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
