import styled from 'styled-components';

import { TimelineName } from '../types';

type TimelineIconProps = {
  className?: string;
  name?: TimelineName;
};

const icons: { [key in TimelineName]: string } = {
  enter_nether: 'flint_and_steel.png',
  enter_bastion: 'cracked_poslished_blackstone_bricks.png',
  enter_fortress: 'nether_bricks.png',
  nether_travel: 'dirt.png',
  enter_stronghold: 'ender_eye.png',
  enter_end: 'end_stone.png',
  complete: 'dragon_head.png',
};

export const TimelineIcon = ({ className, name }: TimelineIconProps) => {
  if (!name) {
    return <EmptyIcon className={className} />;
  }
  const icon = icons[name];
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
