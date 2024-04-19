import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table } from 'flowbite-react';
import React from 'react';

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
                  className='p-2'
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
            console.log(row);
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
  );
};
