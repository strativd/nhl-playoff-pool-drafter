/* eslint-disable no-console */
'use client';

import * as React from 'react';
import '@/lib/env';

import Button from '@/components/buttons/Button';
import { useDatabase } from '@/components/hooks';
import ArrowLink from '@/components/links/ArrowLink';

import { BracketDivision } from './components/BracketDivision';

export default function HomePage() {
  const db = useDatabase();

  const loadData = async () => {
    try {
      await db.setAllTeams();
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
          <ArrowLink href='/' variant='ghost'>
            Draft board
          </ArrowLink>
        </div>
      </div>

      <div className='grid grid-cols-2 grid-rows-2'>
        <BracketDivision division='A' conference='E' />
        <BracketDivision division='C' conference='W' reverseLayout />
        <BracketDivision division='M' conference='E' />
        <BracketDivision division='P' conference='W' reverseLayout />
      </div>
    </main>
  );
}
