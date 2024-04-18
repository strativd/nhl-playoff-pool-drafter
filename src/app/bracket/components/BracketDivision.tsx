import { cn } from '@/lib/utils';

import { TeamsData } from '@/database';

import { PlayoffMatch } from '@/app/bracket/components/PlayoffMatchup';

type BracketDivisionProps = {
  division: TeamsData['division'];
  conference: TeamsData['conference'];
  reverseLayout?: boolean;
};

export const BracketDivision: React.FC<BracketDivisionProps> = ({
  division,
  conference,
  reverseLayout,
}) => {
  const containerClasses = cn(
    'flex gap-5 items-start min-h-72',
    reverseLayout ? 'flex-row-reverse' : 'flex-row'
  );

  return (
    <div className={containerClasses}>
      <div>
        <PlayoffMatch
          matchupId={`${division}:Div1`}
          conference={conference}
          reverseLayout={reverseLayout}
        />
        <PlayoffMatch
          matchupId={`${division}:Div2`}
          conference={conference}
          reverseLayout={reverseLayout}
        />
      </div>
      <div className='flex flex-col items-start justify-around min-h-72'>
        <PlayoffMatch
          matchupId={`${division}:DivFinals`}
          conference={conference}
          reverseLayout={reverseLayout}
        />
      </div>
    </div>
  );
};
