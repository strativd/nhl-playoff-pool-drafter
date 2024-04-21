import { Trophy } from 'lucide-react';

import { TeamsData } from '@/database';

import Button from '@/components/buttons/Button';
import { useTeam } from '@/components/hooks';
import NextImage from '@/components/NextImage';

type TeamButtonProps = {
  teamId?: string;
  disabled?: boolean;
  onClick?: (team: TeamsData) => void;
};

export const TeamButton: React.FC<TeamButtonProps> = ({
  teamId,
  disabled,
  onClick,
}) => {
  const team = useTeam(teamId);

  return team ? (
    <Button
      onClick={() => onClick?.(team)}
      className='min-h-14 min-w-20 flex justify-center align-middle'
      disabled={disabled}
    >
      <NextImage
        className='w-auto h-auto'
        height={50}
        width={50}
        src={team.logo}
        alt={team.name}
      />
    </Button>
  ) : (
    <Button
      className='min-h-14 min-w-20 flex justify-center align-middle'
      variant='outline'
    >
      <Trophy size={30} color='white' />
    </Button>
  );
};
