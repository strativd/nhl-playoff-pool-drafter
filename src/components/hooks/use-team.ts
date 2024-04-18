import { useLiveQuery } from 'dexie-react-hooks';

import { useDatabase } from '@/components/hooks';

export function useTeam(teamId?: string) {
  const db = useDatabase();

  const team = useLiveQuery(async () => {
    return teamId ? await db.teams.get({ id: teamId }) : undefined;
  }, [teamId]);

  return team;
}
