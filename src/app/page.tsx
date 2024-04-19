/* eslint-disable no-console */
'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useLiveQuery } from 'dexie-react-hooks';
import { Table } from 'flowbite-react';
import * as React from 'react';
import '@/lib/env';

import { PlayersData } from '@/database';

import Button from '@/components/buttons/Button';
import { useDatabase } from '@/components/hooks';
import ArrowLink from '@/components/links/ArrowLink';

// const BASE_URL = 'https://api-web.nhle.com';

export default function HomePage() {
  const db = useDatabase();

  const players = useLiveQuery<PlayersData[]>(
    () =>
      (async () => {
        const data = await db.players.toArray();
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

      {players && <PlayerList players={players} />}
    </main>
  );
}

type PlayerListProps = {
  players: PlayersData[];
};

export const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<PlayersData>[]>(
    () => [
      {
        accessorKey: 'teamId',
        header: 'Team',
        id: 'teamId',
      },
      {
        accessorKey: 'position',
        header: 'Pos',
      },
      {
        accessorKey: 'name',
        header: 'Name',
        id: 'name',
      },
      {
        accessorKey: 'goals',
        header: 'G',
      },
      {
        accessorKey: 'assists',
        header: 'A',
      },
      {
        accessorKey: 'points',
        header: 'P',
      },
      {
        accessorKey: 'powerPlayPoints',
        header: 'PP',
      },
      {
        accessorKey: 'shortHandedPoints',
        header: 'SH',
      },
      {
        accessorKey: 'gamesPlayed',
        header: 'GP',
      },
      {
        accessorKey: 'averageSecondsOnIce',
        header: 'TOI/G',
        cell: (cell) => {
          const value = cell.getValue() as number;
          const mins = Math.floor(value / 60);
          const secs = Math.floor(value % 60);
          return `${mins}:${secs.toString().padStart(2, '0')}`;
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: players,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
    // sortingFns: {
    //   sortStatusFn, //or provide our custom sorting function globally for all columns to be able to use
    // },
    //no need to pass pageCount or rowCount with client-side pagination as it is calculated automatically
    state: {
      sorting,
    },
    // autoResetPageIndex: false, // turn off page index reset when sorting or filtering - default on/true
    // enableMultiSort: false, //Don't allow shift key to sort multiple columns - default on/true
    // enableSorting: false, // - default on/true
    // enableSortingRemoval: false, //Don't allow - default on/true
    // isMultiSortEvent: (e) => true, //Make all clicks multi-sort - default requires `shift` key
    // maxMultiSortColCount: 3, // only allow 3 columns to be sorted at once - default is Infinity
  });

  return (
    <div>
      <div className='flex gap-3'>
        <div className='overflow-x-auto w-3/5'>
          <Table striped align='left'>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Head key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Table.HeadCell
                      key={header.id}
                      colSpan={header.colSpan}
                      className='p-2'
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                          title={
                            header.column.getCanSort()
                              ? header.column.getNextSortingOrder() === 'asc'
                                ? 'Sort ascending'
                                : header.column.getNextSortingOrder() === 'desc'
                                  ? 'Sort descending'
                                  : 'Clear sort'
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </Table.HeadCell>
                  );
                })}
              </Table.Head>
            ))}
            <Table.Body>
              {table
                .getRowModel()
                .rows.slice(0, 100)
                .map((row) => {
                  return (
                    <Table.Row key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <Table.Cell key={cell.id} className='p-2'>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Table.Cell>
                        );
                      })}
                    </Table.Row>
                  );
                })}
            </Table.Body>
          </Table>
        </div>
        <div className='flex w-2/5'></div>
      </div>
    </div>
  );
};
