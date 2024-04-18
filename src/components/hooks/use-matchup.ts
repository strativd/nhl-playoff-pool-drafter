import { useLiveQuery } from 'dexie-react-hooks';

import { useDatabase } from '@/components/hooks';

export function useMatchup(matchupId: string) {
  const db = useDatabase();

  const matchup = useLiveQuery(
    () => db.matchups.get({ matchupId }),
    [matchupId]
  );

  const setWinner = async (winnerTeamId: string) => {
    try {
      if (!matchup) throw new Error(`Matchup ${matchupId} not found`);
      await db.setMatchupWinner(matchup, winnerTeamId);
    } catch (error) {
      console.error(error);
    }
  };

  return { setWinner, matchup };
}
