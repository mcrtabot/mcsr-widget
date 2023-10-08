import { camelCase } from 'change-case';
import React from 'react';
import styled from 'styled-components';

import { RecordTimeline, Timeline } from './components/Timeline';
import { usePBSetting, useSetting, useWidgetData } from './hooks';

const parseStyles = (styleString: string): React.CSSProperties => {
  // styleString は以下のような形式
  // textAlign:left; color:#ff3333;
  const style: { [key: string]: string } = {};
  styleString.split(';').forEach((text) => {
    // text は以下のような形式
    // textAlign:left
    const kv = text.split(':');
    const key = camelCase((kv[0] || '').trim());
    const value = (kv[1] || '').trim();

    if (!key) {
      return;
    }
    style[key] = value;
  });

  return style as React.CSSProperties;
};

const App = () => {
  // サンプルモードかどうか
  const params = new URLSearchParams(window.location.search);
  const isDemo = params.get('demo') === '1';
  const widgetName = params.get('widget');

  const widgetData = useWidgetData(isDemo);
  const { isLoading, setting } = useSetting(widgetName);
  const pbTimeline = usePBSetting(isDemo);

  if (isLoading) {
    return <></>;
  }

  if (!setting) {
    return (
      <div style={{ color: 'black', padding: 8 }}>
        設定データ setting/setting{widgetName ? `_${widgetName}` : ''}.json がありません
      </div>
    );
  }
  if (!widgetData) {
    return <></>;
  }

  const widgetStyle = {
    ...(setting.font || {}),
    backgroundColor: setting.backgroundColor,
    color: setting.textColor,
  } as React.CSSProperties;

  return (
    <Wrapper className="mcsr-widget" style={widgetStyle}>
      <WidgetContainer className="mcsr-widget-container" style={{ width: setting.width }}>
        {setting.components.map((item, index) => {
          if (item.startsWith('[CurrentRun]')) {
            return (
              <React.Fragment key={index}>
                <RecordTimeline
                  className="timeline timeline--current"
                  baseRunNumber={widgetData.base_run_number}
                  record={widgetData.running_record}
                  pbTimeline={pbTimeline}
                  displayNextTimelineItem={setting.displayCurrentRunNextTimelineItem}
                  nextTimelineItemStyle={setting.currentRunNextTimelineItemStyle}
                  timelineItemLabels={setting.timelineItemLabels}
                  setting={setting.currentRunTimeline}
                  worldNumberType={setting.worldNumberType}
                />
              </React.Fragment>
            );
          } else if (item.startsWith('[RecentRuns]')) {
            return (
              <React.Fragment key={index}>
                {widgetData.records.slice(0, 20).map((record) => {
                  if (!setting.displayRecentRunsIncompletedRuns && !record.is_completed) {
                    return <React.Fragment key={record.id} />;
                  }
                  return (
                    <RecordTimeline
                      className="timeline timeline--recent"
                      key={record.id}
                      baseRunNumber={widgetData.base_run_number}
                      record={record}
                      pbTimeline={pbTimeline}
                      timelineItemLabels={setting.timelineItemLabels}
                      setting={setting.recentRunsTimeline}
                      worldNumberType={setting.worldNumberType}
                    />
                  );
                })}
              </React.Fragment>
            );
          } else if (item.startsWith('[PersonalBest]')) {
            return (
              <React.Fragment key={index}>
                <Timeline
                  className="timeline timeline--pb"
                  timeline={pbTimeline || []}
                  pbTimeline={pbTimeline}
                  displayAllTimeline={true}
                  timelineItemLabels={setting.timelineItemLabels}
                  setting={setting.pbTimeline}
                />
              </React.Fragment>
            );
          } else if (item.startsWith('[WorldNumber]')) {
            const frags = item.split('|');
            const styleString = frags[1] || '';
            const style = {
              color: setting.textColor,
              fontSize: '32px',
              textAlign: 'center',
              ...parseStyles(styleString),
            } as React.CSSProperties;
            return (
              <Label key={index} className="label label--worldnumber" style={style}>
                {setting.worldNumberType === 'relative' ? widgetData.runs + 1 : widgetData.running_record?.run_number}
              </Label>
            );
          } else if (item.startsWith('[Label]')) {
            const frags = item.split('|');
            const text = frags[1] || '';
            const styleString = frags[2] || '';
            const style = parseStyles(styleString);
            return (
              <Label key={index} className="label" style={style}>
                {text}
              </Label>
            );
          } else if (item.startsWith('[---]')) {
            const frags = item.split('|');
            const styleString = frags[1] || '';
            const style = { borderColor: setting.separatorColor, ...parseStyles(styleString) };
            return <Separator key={index} className="separator" style={style} />;
          }

          return <React.Fragment key={index} />;
        })}
      </WidgetContainer>
    </Wrapper>
  );
};

export default App;

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-y: auto;
`;

const WidgetContainer = styled.div`
  padding: 8px;

  > * {
    margin-top: 8px;
    margin-bottom: 8px;
  }
`;

const Separator = styled.hr`
  border-width: 1px;
  border-style: dashed;
  border-color: #ffffff;
`;

const Label = styled.div``;