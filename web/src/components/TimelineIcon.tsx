import styled from 'styled-components';

import { TimelineName } from '../types';

type TimelineIconProps = {
  className?: string;
  name?: TimelineName;
  pattern?: 1 | 2;
};

const icons1: { [key in TimelineName]: string } = {
  enter_nether: 'flint_and_steel.png',
  enter_bastion: 'piglin.png',
  enter_fortress: 'blaze.png',
  nether_travel: 'dirt.png',
  enter_stronghold: 'ender_eye.png',
  enter_end: 'end_stone.png',
  complete: 'dragon_head.png',
};
const icons2: { [key in TimelineName]: string } = {
  enter_nether: 'flint_and_steel.png',
  enter_bastion: 'glided_blackstone.png',
  enter_fortress: 'nether_bricks.png',
  nether_travel: 'dirt.png',
  enter_stronghold: 'ender_eye.png',
  enter_end: 'end_stone.png',
  complete: 'dragon_head.png',
};

const icons = {
  1: icons1,
  2: icons2,
};

export const TimelineIcon = ({ className, name, pattern = 1 }: TimelineIconProps) => {
  if (!name) {
    return <EmptyIcon className={className} />;
  }
  const icon = (icons[pattern] ?? icons[1])[name];
  return <Icon className={className} src={`/images/${icon}`} />;
};

const Icon = styled.img`
  width: 24px;
  height: 24px;
`;

const EmptyIcon = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
`;
