// provide a react hook to filter the players table and filter by multiple teams

import { useLiveQuery } from 'dexie-react-hooks';
import React from 'react';

import { useDatabase } from '@/components/hooks';

export const useTeamsFilter = () => {
  const db = useDatabase();

  const [selectedTeams, setSelectedTeams] = React.useState<string[]>([]);

  const teams = useLiveQuery<string[]>(
    () =>
      (async () => {
        const data = await db.matchups.toArray();
        const teams: string[] = [];
        data.forEach((matchup) => {
          if (matchup.nextMatchupId) {
            matchup.homeTeamId && teams.push(matchup.homeTeamId);
            matchup.awayTeamId && teams.push(matchup.awayTeamId);
          }
        });
        return teams;
      })(),
    [],
  );

  const handleTeamChange = (team: string) => {
    let newTeams = [...selectedTeams];
    if (selectedTeams.includes(team)) {
      newTeams = newTeams.filter((t) => t !== team);
    } else {
      newTeams.push(team);
    }
    setSelectedTeams(newTeams);
  };

  return { teams, selectedTeams, handleTeamChange };
};
