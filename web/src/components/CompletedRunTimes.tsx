import React from 'react';
import styled from 'styled-components';

import { SpeedrunRecord, TimelineSetting } from '../types';
import { Time } from './Time';

type CompletedTimeProps = {
  className?: string;
  records: SpeedrunRecord[];
  setting: TimelineSetting;
};

export const CompletedRunTimes = ({
  className,
  records,
  setting: { font, textColor, backgroundColor, displayTitle, title },
}: CompletedTimeProps) => {
  const completedRecords = records.filter((record) => record.is_completed);
  if (completedRecords.length === 0) {
    return <></>;
  }
  return (
    <Wrapper
      className={className}
      style={{
        ...font,
        backgroundColor,
        color: textColor,
      }}
    >
      {displayTitle && (
        <>
          <Title style={{ ...font, color: textColor }}>{title}</Title>
          <Separator style={{ borderBottom: `2px solid ${textColor}` }} />
        </>
      )}
      {completedRecords.reverse().map((record, index) => (
        <Item key={record.id}>
          <Label>{index + 1}.</Label>
          <TimeWrapper>
            <Time value={record.final_igt} />
          </TimeWrapper>
        </Item>
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border-radius: 8px;
`;

const Title = styled.div`
  text-align: center;
`;

const Item = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const Label = styled.div`
  min-width: 40px;
  text-align: right;
`;
const TimeWrapper = styled.div`
  margin-left: auto;
`;

const Separator = styled.hr`
  border: none;
  border-bottom: 2px solid var(--recordTimelineTextColor);
  margin-bottom: 8px;
`;
