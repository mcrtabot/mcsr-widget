import useSWR from 'swr/immutable';

import { Setting, TimelineName, TimelineSetting, WidgetData } from './types';

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

const mergeTimelineSetting = (a: TimelineSetting, b: TimelineSetting) => {
  const aFont = a.font || {};
  const aItemLabelFont = { ...a.font, ...(a.itemLabelFont || {}) };
  const aItemDiffTimeFont = { ...a.font, ...(a.itemDiffTimeFont || {}) };

  const bFont = b.font || {};
  const bItemLabelFont = { ...b.font, ...(b.itemLabelFont || {}) };
  const bItemDiffTimeFont = { ...b.font, ...(b.itemDiffTimeFont || {}) };

  return {
    ...a,
    ...b,
    font: { ...aFont, ...bFont },
    itemLabelFont: { ...aItemLabelFont, ...bItemLabelFont },
    itemDiffTimeFont: { ...aItemDiffTimeFont, ...bItemDiffTimeFont },
  };
};

export const useSetting = (name: string | null) => {
  const path = !name ? '/data/setting/setting.json' : `/data/setting/setting_${name}.json`;
  const { isLoading, data: rawSetting } = useSWR<Setting>(path, fetcher, { refreshInterval: REFRESH_INTERVAL });

  if (!rawSetting) {
    return { isLoading, setting: undefined };
  }

  const setting: Setting = {
    ...rawSetting,
    pbTimeline: mergeTimelineSetting(rawSetting.timeline, rawSetting.pbTimeline),
    currentRunTimeline: mergeTimelineSetting(rawSetting.timeline, rawSetting.currentRunTimeline),
    recentRunsTimeline: mergeTimelineSetting(rawSetting.timeline, rawSetting.recentRunsTimeline),
  };

  return { isLoading, setting };
};

export const useWidgetData = (isDemo: boolean) => {
  const path = !isDemo ? '/data/widget/widget.json' : '/data/demo/widget.json';
  const { data } = useSWR<WidgetData>(path, fetcher, { refreshInterval: REFRESH_INTERVAL });
  return data;
};

export const usePBSetting = (isDemo: boolean) => {
  const path = !isDemo ? '/data/setting/pb.json' : '/data/demo/pb.json';
  const { data } = useSWR<{ name: TimelineName; igt: string }[]>(path, fetcher, { refreshInterval: REFRESH_INTERVAL });

  if (!data) {
    return [];
  }

  return data.map((item) => ({
    name: item.name,
    igt: convertTimeToMilliSeconds(item.igt),
  }));
};
