/* eslint-disable no-console */
'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as React from 'react';
import '@/lib/env';

import { PlayersData } from '@/database';

import Button from '@/components/buttons/Button';
import { useDatabase } from '@/components/hooks';
import ArrowLink from '@/components/links/ArrowLink';
import { PlayerTable, WishlistTable } from '@/components/player-list';

// const BASE_URL = 'https://api-web.nhle.com';

export default function HomePage() {
  const db = useDatabase();

  const players = useLiveQuery<PlayersData[]>(
    () =>
      (async () => {
        const data = await db.players.orderBy('points').reverse().toArray();
        return data;
      })(),
    [],
  );

  const watchlisted = useLiveQuery<PlayersData[]>(
    () =>
      (async () => {
        const data = await db.players
          .filter((player) => !!player.watching && !player.drafted)
          .toArray();
        return data;
      })(),
    [],
  );

  const loadPlayers = async () => {
    try {
      await db.setAllPlayers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className=' p-10'>
      <div className='flex justify-between align-middle mb-6'>
        <h1 className='text-5xl'>Draft board</h1>
        <div className='flex gap-3'>
          <Button variant='outline' onClick={loadPlayers}>
            Load players
          </Button>
          <ArrowLink href='/bracket'>Playoff bracket</ArrowLink>
        </div>
      </div>
      <div className='flex gap-6'>
        <div className='overflow-x-auto w-3/5'>
          <PlayerTable players={players} />
        </div>
        <div className='flex w-2/5'>
          <WishlistTable players={watchlisted} />
        </div>
      </div>
    </main>
  );
}
