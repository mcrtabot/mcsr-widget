export type TimelineItem = {
  name: TimelineName;
  igt?: number;
};

export type FontSetting = {
  family: React.CSSProperties['fontFamily'];
  size: React.CSSProperties['fontSize'];
  style: React.CSSProperties['fontStyle'];
  wight: React.CSSProperties['fontWeight'];
};

export type SpeedrunRecord = {
  id: string;
  run_number: number;
  mc_version: string;
  speedrunigt_version: string;
  category: string;
  run_type: string;
  is_completed: boolean;
  is_coop: boolean;
  is_hardcore: boolean;
  world_name: string;
  date: number;
  retimed_igt: number;
  final_igt: number;
  final_rta: number;
  open_lan: boolean;
  timelines: TimelineItem[];
};

export type WidgetData = {
  base_run_number: number;
  runs: number;
  completes: number;
  records: SpeedrunRecord[];
  running_record: SpeedrunRecord | null;
};

export const TimelineNames = [
  'enter_nether',
  'enter_bastion',
  'enter_fortress',
  'nether_travel',
  'enter_stronghold',
  'enter_end',
  'complete',
] as const;
export type TimelineName = typeof TimelineNames[number];
export type PBSetting = { [key in TimelineName]?: string };

type TimelineItemDiffPosition = null | 'left' | 'right' | 'bottom';
export type WorldNumberType = 'relative' | 'absolute';
export type TimelineNextItemStyle = 'hyphen' | 'random';

export type TimelineSetting = {
  font: FontSetting;
  textColor: string;
  highlightTextColor: string;
  backgroundColor: string;
  imcompletedBackgroundColor: string;
  displayTitle: boolean;
  title: string | '[WorldNumber]';
  displayItemLabel: boolean;
  itemLabelFont: FontSetting;
  displayItemDiffTime: boolean;
  itemDiffTimePosition: TimelineItemDiffPosition;
  itemDiffTimeFont: FontSetting;
};

export type Setting = {
  width: number;
  backgroundColor: string;
  textColor: string;
  font: FontSetting;
  separatorColor: string;
  components: string[];
  timelineItemLabels: { [key: string]: string };
  timeline: TimelineSetting;
  pbTimeline: TimelineSetting;
  currentRunTimeline: TimelineSetting;
  recentRunsTimeline: TimelineSetting;
  displayRecentRunsIncompletedRuns: boolean;
  worldNumberType: WorldNumberType;

  displayCurrentRunNextTimelineItem: boolean;
  currentRunNextTimelineItemStyle: TimelineNextItemStyle;
};
