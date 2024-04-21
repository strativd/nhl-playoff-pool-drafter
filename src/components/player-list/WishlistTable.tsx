import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table } from 'flowbite-react';
import React from 'react';

import { cn } from '@/lib/utils';

import { PlayersData } from '@/database';

type WishlistTableProps = {
  players?: PlayersData[];
};

export const WishlistTable: React.FC<WishlistTableProps> = ({
  players = [],
}) => {
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
        accessorKey: 'expectedPoints',
        header: 'xPTS',
        id: 'expected-points',
      },
      {
        accessorKey: 'pointsPerGame',
        header: 'PTS/G',
        id: 'points-per-game',
      },
      {
        accessorKey: 'gamesPlayed',
        header: 'GP',
      },
      {
        accessorKey: 'points',
        header: 'PTS',
      },
      {
        accessorKey: 'powerPlayPoints',
        header: 'PP',
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: players,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='w-full'>
      <Table striped align='left'>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Head key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <Table.HeadCell
                  key={header.id}
                  colSpan={header.colSpan}
                  className='p-1'
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </Table.HeadCell>
              );
            })}
          </Table.Head>
        ))}
        <Table.Body>
          {table.getRowModel().rows.map((row) => {
            return (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const classes = cn(
                    'p-1',
                    cell.column.id === 'expected-points' ? 'font-bold' : '',
                    typeof cell.getValue() === 'number' ? 'font-mono' : '',
                  );
                  return (
                    <Table.Cell key={cell.id} className={classes}>
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
  );
};
