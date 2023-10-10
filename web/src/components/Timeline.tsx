import React, { useMemo } from 'react';
import styled from 'styled-components';

import {
  FontSetting,
  SpeedrunRecord,
  TimelineItem,
  TimelineName,
  TimelineNames,
  TimelineNextItemStyle,
  TimelineSetting,
  WorldNumberType,
} from '../types';
import { RandomTime } from './RandomTime';
import { Time } from './Time';
import { TimelineIcon as TLIcon } from './TimelineIcon';

type TimelineProps = {
  className?: string;

  title?: string;
  timeline: TimelineItem[];
  pbTimeline?: TimelineItem[];

  displayAllTimeline?: boolean;
  displayNextTimelineItem?: boolean;
  nextTimelineItemStyle?: TimelineNextItemStyle;

  timelineItemLabels: { [key: string]: string };
  setting: TimelineSetting;
};

type TimelinePattern = 'BastionFortress' | 'FortressBastion';
const timelineOrders: { [key in TimelinePattern]: TimelineName[] } = {
  BastionFortress: [
    'enter_nether',
    'enter_bastion',
    'enter_fortress',
    'nether_travel',
    'enter_stronghold',
    'enter_end',
    'complete',
  ],
  FortressBastion: [
    'enter_nether',
    'enter_fortress',
    'enter_bastion',
    'nether_travel',
    'enter_stronghold',
    'enter_end',
    'complete',
  ],
};

const getTimelinePattern = (timeline?: TimelineItem[]): TimelinePattern => {
  const ebIndex = (timeline ?? []).findIndex((item) => item.name === 'enter_bastion');
  const efIndex = (timeline ?? []).findIndex((item) => item.name === 'enter_fortress');
  if (ebIndex >= 0 && efIndex >= 0) {
    return ebIndex < efIndex ? 'BastionFortress' : 'FortressBastion';
  } else if (ebIndex >= 0 || efIndex >= 0) {
    return ebIndex >= 0 ? 'BastionFortress' : 'FortressBastion';
  }
  return 'BastionFortress';
};
export const Timeline = ({
  className,
  title,
  timeline,
  pbTimeline,
  displayAllTimeline = false,
  displayNextTimelineItem = false,
  nextTimelineItemStyle = 'hyphen',
  timelineItemLabels,
  setting: {
    font,
    textColor,
    highlightTextColor,
    backgroundColor,
    imcompletedBackgroundColor,
    displayTitle,
    title: fixTitle,
    displayItemLabel,
    itemLabelFont,
    displayItemDiffTime,
    itemDiffTimePosition,
    itemDiffTimeFont,
    iconPattern,
  },
}: TimelineProps) => {
  const isCompleted = !!timeline.find((item) => item.name === 'complete');

  const timelinePattern = useMemo(() => getTimelinePattern(timeline), [timeline]);
  const isSameTimelinePattern = useMemo(() => {
    // bastion → fortress かその逆かの流れが異なる場合、bastion, fortressでPBペースでの色の変化、PBとのタイム差分の表示を行わない
    const pbTimelinePattern = getTimelinePattern(pbTimeline);
    return timelinePattern === pbTimelinePattern;
  }, [pbTimeline, timelinePattern]);

  const nextItemName = useMemo(() => {
    const timelineOrder = timelineOrders[timelinePattern];
    const lastItemName = timeline.filter((item) => timelineOrder.includes(item.name)).slice(-1)[0]?.name;
    const lastItemIndex = timelineOrder.indexOf(lastItemName);
    return timelineOrder[lastItemIndex + 1];
  }, [timeline, timelinePattern]);

  return (
    <Wrapper
      className={className}
      style={{
        ...font,
        backgroundColor: !isCompleted && imcompletedBackgroundColor ? imcompletedBackgroundColor : backgroundColor,
      }}
    >
      {displayTitle && (
        <>
          <Title style={{ ...font, color: textColor }}>{title || fixTitle}</Title>
          <Separator style={{ borderBottom: `2px solid ${textColor}` }} />
        </>
      )}
      <TLContainer>
        <tbody>
          {timeline.map((item) => {
            const name = item.name as TimelineName;
            if (!TimelineNames.includes(name as TimelineName)) {
              return <React.Fragment key={name} />;
            }

            const time = item.igt;
            if (!time && !displayAllTimeline) {
              return <React.Fragment key={name} />;
            }

            const pbTime = pbTimeline?.find((pbItem) => pbItem.name === name)?.igt ?? 0;
            const displayDiff = !(!isSameTimelinePattern && (name === 'enter_bastion' || name === 'enter_fortress'));
            const conditionalTextColor =
              !time ||
              time >= pbTime ||
              (!isSameTimelinePattern && (name === 'enter_bastion' || name === 'enter_fortress'))
                ? textColor
                : highlightTextColor;
            const labelStyle = {
              ...itemLabelFont,
              color: conditionalTextColor,
            };

            const diffTimeProps: DiffTimeProps = {
              time,
              pbTime,
              textColor,
              highlightTextColor: conditionalTextColor,
              font: itemDiffTimeFont,
              displayDiff,
            };
            return (
              <React.Fragment key={name}>
                <TLItem className="timeline__item">
                  <IconCell>
                    <TLIcon className="timeline__item__icon" name={name} pattern={iconPattern} />
                  </IconCell>

                  {displayItemLabel && (
                    <LabelCell>
                      <TimeLabel className="timeline__item__label" style={labelStyle}>
                        {timelineItemLabels[name]}
                      </TimeLabel>
                    </LabelCell>
                  )}

                  {displayItemDiffTime && itemDiffTimePosition === 'left' && (
                    <TimeCell>
                      <DiffTime className="timeline__item__diff" {...diffTimeProps} />
                    </TimeCell>
                  )}

                  <TimeCell>
                    <TimeLabel
                      className="timeline__item__time"
                      style={{
                        ...font,
                        color: conditionalTextColor,
                      }}
                    >
                      {time ? <Time value={time} /> : '--:--'}
                    </TimeLabel>
                  </TimeCell>

                  {displayItemDiffTime && itemDiffTimePosition === 'right' && (
                    <TimeCell>
                      <DiffTime className="timeline__item__diff" {...diffTimeProps} />
                    </TimeCell>
                  )}
                </TLItem>
                <TLItem className="timeline__item">
                  {displayItemDiffTime && itemDiffTimePosition === 'bottom' && (
                    <TimeCell colSpan={2}>
                      <DiffTime className="timeline__item__diff" {...diffTimeProps} />
                    </TimeCell>
                  )}
                </TLItem>
              </React.Fragment>
            );
          })}
          {!isCompleted && !displayAllTimeline && displayNextTimelineItem && (
            <TLItem className="timeline__item--next">
              <IconCell>
                <TLIcon className="timeline__item__icon" name={nextItemName} pattern={iconPattern} />
              </IconCell>

              {displayItemDiffTime && itemDiffTimePosition === 'left' && (
                <TimeCell>
                  <TimeLabel className="timeline__item__diff" style={{ ...itemDiffTimeFont, color: textColor }}>
                    --:--
                  </TimeLabel>
                </TimeCell>
              )}

              <TimeCell>
                <TimeLabel className="timeline__item__time" style={{ ...font, color: textColor }}>
                  {nextTimelineItemStyle === 'hyphen' ? <>--:--</> : <RandomTime />}
                </TimeLabel>
              </TimeCell>

              {displayItemDiffTime && itemDiffTimePosition === 'right' && (
                <TimeCell>
                  <TimeLabel className="timeline__item__diff" style={{ ...itemDiffTimeFont, color: textColor }}>
                    --:--
                  </TimeLabel>
                </TimeCell>
              )}
            </TLItem>
          )}
        </tbody>
      </TLContainer>
    </Wrapper>
  );
};

type DiffTimeProps = {
  className?: string;
  time?: number;
  pbTime: number;
  textColor: string;
  highlightTextColor: string;
  font: FontSetting;
  displayDiff: boolean;
};

const DiffTime = ({ className, time, pbTime, textColor, highlightTextColor, font, displayDiff }: DiffTimeProps) => {
  return (
    <TimeLabel
      className={className}
      style={{
        ...font,
        color: time ? (time < pbTime && highlightTextColor ? highlightTextColor : textColor) : textColor,
      }}
    >
      {time && pbTime && displayDiff ? <Time value={time - pbTime} displaySign={true} /> : '--:--'}
    </TimeLabel>
  );
};

type RecordTimelineProps = {
  className?: string;
  record: SpeedrunRecord | null;
  baseRunNumber?: number;
  worldNumberType: WorldNumberType;
} & Omit<TimelineProps, 'timeline'>;

export const RecordTimeline = ({
  className,
  record,
  baseRunNumber,
  worldNumberType,
  setting,
  ...restProps
}: RecordTimelineProps) => {
  let title = '';
  if (setting.title === '[WorldNumber]') {
    title =
      baseRunNumber && record && record.run_number
        ? worldNumberType === 'relative'
          ? `#${record.run_number - baseRunNumber + 1}`
          : `#${record.run_number}`
        : '';
  }

  const timelines = record?.timelines.slice() ?? [];
  if (record?.is_completed) {
    timelines.push({ name: 'complete', igt: record.final_igt });
  }

  return <Timeline className={className} title={title} timeline={timelines} setting={setting} {...restProps} />;
};

const Wrapper = styled.div<{ colored?: boolean }>`
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border-radius: 8px;
`;

const Title = styled.div`
  text-align: center;
`;

const Separator = styled.hr`
  border: none;
  border-bottom: 2px solid var(--recordTimelineTextColor);
  margin-bottom: 8px;
`;

const TLContainer = styled.table`
  margin: 4px 0;
  width: 100%;
`;

const TLItem = styled.tr`
  padding: 0 8px;
`;

const Cell = styled.td`
  vertical-align: middle;
`;

const IconCell = styled(Cell)``;

const LabelCell = styled(Cell)``;

const TimeCell = styled(Cell)`
  text-align: right;
`;

const TimeLabel = styled.div<{ highlight?: boolean }>``;
