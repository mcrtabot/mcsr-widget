import React from 'react';

type TimeProps = {
  value: number;
  displaySign?: boolean;
  displayMilliSeconds?: boolean;
};

export const Time = ({ value, displaySign, displayMilliSeconds = false }: TimeProps) => {
  const t = parseTime(Math.abs(value) / 1000);
  let hms = `${(t.h * 60 + t.m).toString().padStart(2, '0')}:${t.s.toString().padStart(2, '0')}`;
  if (displayMilliSeconds) {
    const milliseconds = `000${t.ms}`.slice(-3);
    hms = hms + `.${milliseconds}`;
  }
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
