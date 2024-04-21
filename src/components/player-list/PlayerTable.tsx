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
  const [hideDrafted, setHideDrafted] = React.useState<boolean>(false);
  const prevHideDrafted = React.useRef<boolean>(hideDrafted);

  const { handleTeamChange, selectedTeams, teams } = useTeamsFilter();

  const filteredPlayers: PlayersData[] = React.useMemo(
    () =>
      filterName.length
        ? players.filter((p) =>
            p.name.toLowerCase().includes(filterName.toLowerCase()),
          )
        : players.filter((p) => {
            let showPlayer = true;
            if (hideDrafted) {
              showPlayer = !p.drafted;
            }
            if (showPlayer && selectedTeams.length) {
              showPlayer = selectedTeams.includes(p.teamId);
            }
            return showPlayer;
          }),
    [filterName, players, hideDrafted, selectedTeams],
  );

  // Update the state when input changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || '';
    if (value.length > 0) {
      setHideDrafted(false);
    } else {
      setHideDrafted(prevHideDrafted.current);
    }
    setFilterName(value);
  };

  const columns = React.useMemo<ColumnDef<PlayersData>[]>(
    () => [
      {
        header: '✅',
        cell: ({ row }) => (
          <Table.Cell className='p-2 px-0 w-4'>
            <DraftedCheckbox
              isDrafted={row.original.drafted}
              playerId={row.original.id}
            />
          </Table.Cell>
        ),
      },
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
        header: '👀',
        cell: ({ row }) => (
          <Table.Cell className='p-2 px-0 w-4'>
            <WatchlistCheckbox
              isWatching={row.original.watching}
              playerId={row.original.id}
            />
          </Table.Cell>
        ),
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
        accessorKey: 'points',
        header: 'PTS',
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
    // debugTable: true,
    columns,
    data: filteredPlayers,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
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
          disabled={filterName.length > 0}
          onChange={() => {
            const value = !hideDrafted;
            prevHideDrafted.current = value;
            setHideDrafted(value);
          }}
        />
        <Label className='text-white' htmlFor='show-drafted'>
          Hide drafted
        </Label>
        <div className='grow' />
        <Label className='text-white'>👀 → {filteredPlayers.length}</Label>
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
              disabled={filterName.length > 0}
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
            .rows.slice(0, 250)
            .map((row) => {
              return (
                <Table.Row key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const classes = cn(
                      'p-0 px-2',
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
