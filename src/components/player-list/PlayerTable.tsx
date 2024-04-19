import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Checkbox, Label, Table, TextInput } from 'flowbite-react';
import React from 'react';

import { cn } from '@/lib/utils';

import { PlayersData } from '@/database';

import TextButton from '@/components/buttons/TextButton';
import { useDatabase } from '@/components/hooks';
import { useTeamsFilter } from '@/components/player-list/use-teams-filter';

type PlayerTableProps = {
  players?: PlayersData[];
};

export const PlayerTable: React.FC<PlayerTableProps> = ({ players = [] }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filterName, setFilterName] = React.useState<string>('');
  const [hideDrafted, setHideDrafted] = React.useState<boolean>(true);

  const { handleTeamChange, selectedTeams, teams } = useTeamsFilter();

  const filteredPlayers = React.useMemo(
    () => {
      return players.filter((p) => {
        let showPlayer = true;
        if (hideDrafted) {
          showPlayer = !p.drafted;
        }
        if (showPlayer && filterName.length) {
          showPlayer = p.name.toLowerCase().includes(filterName.toLowerCase());
        }
        // TODO: Add filter for team
        if (showPlayer && selectedTeams.length) {
          showPlayer = selectedTeams.includes(p.teamId);
        }
        return showPlayer;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterName, players, hideDrafted, selectedTeams],
  );

  // Update the state when input changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || '';
    setFilterName(value);
  };

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
        header: 'P/G',
        id: 'points-per-game',
        cell: (row) => {
          const points = row.row.original.points;
          const gamesPlayed = row.row.original.gamesPlayed;
          return <b>{(points / gamesPlayed).toFixed(2)}</b>;
        },
      },
      {
        accessorKey: 'points',
        header: 'P',
        id: 'points',
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
    data: filteredPlayers,
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
    initialState: {
      sorting: [
        {
          id: 'points',
          desc: false,
        },
      ],
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
      <TextInput
        value={filterName}
        onChange={handleFilterChange}
        placeholder='Search players...'
        className='mb-3 w-full text-black'
      />

      <div className='flex gap-2 m-4'>
        <Checkbox
          id='show-drafted'
          checked={hideDrafted}
          onChange={() => setHideDrafted(!hideDrafted)}
        />
        <Label className='text-white' htmlFor='show-drafted'>
          Hide drafted
        </Label>
      </div>

      <div className='flex gap-1 m-4 justify-between'>
        {teams?.map((team) => {
          const classes = cn(
            'font-normal rounded p-0 px-2',
            selectedTeams.includes(team) ? 'bg-primary-100' : 'bg-primary-400',
          );

          return (
            <TextButton
              className={classes}
              variant='basic'
              key={team}
              onClick={() => handleTeamChange(team)}
            >
              {team}
            </TextButton>
          );
        })}
      </div>

      <Table striped align='left'>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Head key={headerGroup.id}>
            <Table.HeadCell className='p-2 w-8'></Table.HeadCell>
            <Table.HeadCell className='p-2 w-8'></Table.HeadCell>
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
            .rows.slice(0, 10)
            .map((row) => {
              console.log(row);
              return (
                <Table.Row key={row.id}>
                  <Table.Cell className='p-2 w-8'>
                    <DraftedCheckbox
                      isDrafted={row.original.drafted}
                      playerId={row.original.id}
                    />
                  </Table.Cell>
                  <Table.Cell className='p-2 w-8'>
                    <WatchlistCheckbox
                      isWatching={row.original.watching}
                      playerId={row.original.id}
                    />
                  </Table.Cell>
                  {row.getVisibleCells().map((cell) => {
                    // console.log(cell);
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

type DraftedProps = { playerId?: number; isDrafted: boolean };

const DraftedCheckbox: React.FC<DraftedProps> = ({ playerId, isDrafted }) => {
  const db = useDatabase();

  const handleClick = async () => {
    if (!playerId) return;
    await db.players.update(playerId, { drafted: !isDrafted });
  };

  return <Checkbox size={40} checked={isDrafted} onChange={handleClick} />;
};

type WatchingProps = { playerId?: number; isWatching: boolean };

const WatchlistCheckbox: React.FC<WatchingProps> = ({
  playerId,
  isWatching,
}) => {
  const db = useDatabase();

  const handleClick = async () => {
    if (!playerId) return;
    await db.players.update(playerId, { watching: !isWatching });
  };

  return <Checkbox size={40} checked={isWatching} onChange={handleClick} />;
};
