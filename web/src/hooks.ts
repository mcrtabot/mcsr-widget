import useSWR from 'swr/immutable';

import { defaultSetting, mergeTimelineSetting } from './setting';
import { Setting, TimelineName, WidgetData } from './types';

const REFRESH_INTERVAL = 1000;

const fetcher = async (path: string) => {
  const response = await fetch(path, { cache: 'no-store' });
  return await response.json();
};

const convertTimeToMilliSeconds = (time?: string) => {
  if (!time) {
    return undefined;
  }
  const match = time.match(/(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:\.(\d+))?/);
  if (!match) {
    return undefined;
  }
  const h = match.at(1);
  const m = match.at(2);
  const s = match.at(3);
  const ms = match.at(4);
  return (
    (h ? parseInt(h, 10) * 60 * 60 * 1000 : 0) +
    (m ? parseInt(m, 10) * 60 * 1000 : 0) +
    (s ? parseInt(s, 10) * 1000 : 0) +
    (ms ? parseInt(ms, 10) : 0)
  );
};

export const useSetting = (name: string | null) => {
  const path = !name ? '/data/setting/setting.json' : `/data/setting/setting_${name}.json`;
  const { isLoading, data: rawSetting, error } = useSWR<Setting>(path, fetcher, { refreshInterval: REFRESH_INTERVAL });

  if (isLoading || !rawSetting || !!error) {
    return { isLoading, setting: undefined, hasError: !!error };
  }

  const setting: Setting = {
    ...defaultSetting,
    ...rawSetting,
    pbTimeline: mergeTimelineSetting(rawSetting.timeline, rawSetting.pbTimeline || {}),
    currentRunTimeline: mergeTimelineSetting(rawSetting.timeline, rawSetting.currentRunTimeline || {}),
    recentRunsTimeline: mergeTimelineSetting(rawSetting.timeline, rawSetting.recentRunsTimeline || {}),
    completedRunTimes: mergeTimelineSetting(rawSetting.timeline, rawSetting.completedRunTimes || {}),
  };

  return { isLoading, setting };
};

export const useWidgetData = (isDemo: boolean) => {
  const path = !isDemo ? '/data/widget/widget.json' : '/data/demo/widget.json';
  const { isLoading, data, error } = useSWR<WidgetData>(path, fetcher, { refreshInterval: REFRESH_INTERVAL });
  return { isLoading, data, hasError: !!error };
};

export const usePBSetting = (isDemo: boolean) => {
  const path = !isDemo ? '/data/setting/pb.json' : '/data/demo/pb.json';
  const {
    isLoading,
    data: rawPBSetting,
    error,
  } = useSWR<{ name: TimelineName; igt: string }[]>(path, fetcher, {
    refreshInterval: REFRESH_INTERVAL,
  });

  if (isLoading || !rawPBSetting || !!error) {
    return { isLoading, data: [], hasError: !!error };
  }

  const data = rawPBSetting.map((item) => ({
    name: item.name,
    igt: convertTimeToMilliSeconds(item.igt),
  }));

  return { isLoading, data, hasError: !!error };
};
