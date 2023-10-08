import React from 'react';

type TimeProps = {
  value: number;
  displaySign?: boolean;
};

export const Time = ({ value, displaySign }: TimeProps) => {
  const t = parseTime(Math.abs(value) / 1000);
  const hms = `${(t.h * 60 + t.m).toString().padStart(2, '0')}:${t.s.toString().padStart(2, '0')}`;
  return (
    <>
      {displaySign && (value >= 0 ? '+' : '-')}
      {hms}
    </>
  );
};

const parseTime = (value: number) => {
  return {
    h: Math.floor(value / 3600),
    m: Math.floor(value / 60) % 60,
    s: Math.floor(value) % 60,
    ms: Math.round((value * 1000) % 1000),
  };
};
