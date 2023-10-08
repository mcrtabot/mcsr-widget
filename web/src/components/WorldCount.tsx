import { WorldNumberType } from '../types';

type WorldNumberProps = {
  type: WorldNumberType;
  runNumber: number;
  baseRunNumber: number;
};

export const WorldNumber = ({ type, runNumber, baseRunNumber }: WorldNumberProps) => {
  if (type === 'absolute') {
    return <>{runNumber}</>;
  }
  return <>{runNumber - baseRunNumber + 1}</>;
};
